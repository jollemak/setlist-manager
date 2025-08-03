const express = require('express');
const { body, validationResult, param } = require('express-validator');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const songValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('lyrics')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Lyrics are required')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid song ID')
];

// Get all songs for the authenticated user
router.get('/', asyncHandler(async (req, res) => {
  const { search, limit = 50, offset = 0 } = req.query;

  const where = {
    userId: req.user.id,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { lyrics: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      select: {
        id: true,
        title: true,
        lyrics: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            setlistSongs: true
          }
        }
      }
    }),
    prisma.song.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      songs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    }
  });
}));

// Get single song
router.get('/:id', idValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const song = await prisma.song.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id
    },
    include: {
      setlistSongs: {
        include: {
          setlist: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }

  res.json({
    success: true,
    data: { song }
  });
}));

// Create song
router.post('/', songValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { title, lyrics } = req.body;

  const song = await prisma.song.create({
    data: {
      title,
      lyrics,
      userId: req.user.id
    },
    select: {
      id: true,
      title: true,
      lyrics: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Song created successfully',
    data: { song }
  });
}));

// Update song
router.put('/:id', [...idValidation, ...songValidation], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { title, lyrics } = req.body;
  const songId = parseInt(req.params.id);

  // Check if song exists and belongs to user
  const existingSong = await prisma.song.findFirst({
    where: {
      id: songId,
      userId: req.user.id
    }
  });

  if (!existingSong) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }

  const song = await prisma.song.update({
    where: { id: songId },
    data: { title, lyrics },
    select: {
      id: true,
      title: true,
      lyrics: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'Song updated successfully',
    data: { song }
  });
}));

// Delete song
router.delete('/:id', idValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const songId = parseInt(req.params.id);

  // Check if song exists and belongs to user
  const existingSong = await prisma.song.findFirst({
    where: {
      id: songId,
      userId: req.user.id
    }
  });

  if (!existingSong) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }

  // Delete song (this will cascade delete setlistSongs due to schema)
  await prisma.song.delete({
    where: { id: songId }
  });

  res.json({
    success: true,
    message: 'Song deleted successfully'
  });
}));

module.exports = router;
