const express = require('express');
const { body, validationResult, param } = require('express-validator');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const setlistValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid setlist ID')
];

const addSongValidation = [
  body('songId')
    .isInt({ min: 1 })
    .withMessage('Valid song ID is required'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer')
];

// Get all setlists for the authenticated user
router.get('/', asyncHandler(async (req, res) => {
  const { search, limit = 50, offset = 0 } = req.query;

  const where = {
    userId: req.user.id,
    ...(search && {
      name: { contains: search, mode: 'insensitive' }
    })
  };

  const [setlists, total] = await Promise.all([
    prisma.setlist.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        _count: {
          select: {
            setlistSongs: true
          }
        },
        setlistSongs: {
          orderBy: { order: 'asc' },
          include: {
            song: {
              select: {
                id: true,
                title: true,
                lyrics: true
              }
            }
          }
        }
      }
    }),
    prisma.setlist.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      setlists: setlists.map(setlist => ({
        ...setlist,
        songs: setlist.setlistSongs.map(ss => ({
          ...ss.song,
          order: ss.order
        })),
        setlistSongs: undefined // Remove the raw setlistSongs
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    }
  });
}));

// Get single setlist with all songs
router.get('/:id', idValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const setlist = await prisma.setlist.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id
    },
    include: {
      setlistSongs: {
        orderBy: { order: 'asc' },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              lyrics: true
            }
          }
        }
      }
    }
  });

  if (!setlist) {
    return res.status(404).json({
      success: false,
      message: 'Setlist not found'
    });
  }

  // Format the response to match frontend expectations
  const formattedSetlist = {
    ...setlist,
    songs: setlist.setlistSongs.map(ss => ({
      ...ss.song,
      order: ss.order
    })),
    setlistSongs: undefined // Remove the raw setlistSongs
  };

  res.json({
    success: true,
    data: { setlist: formattedSetlist }
  });
}));

// Create setlist
router.post('/', setlistValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name } = req.body;

  const setlist = await prisma.setlist.create({
    data: {
      name,
      userId: req.user.id
    },
    include: {
      _count: {
        select: {
          setlistSongs: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Setlist created successfully',
    data: { setlist }
  });
}));

// Update setlist
router.put('/:id', [...idValidation, ...setlistValidation], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name } = req.body;
  const setlistId = parseInt(req.params.id);

  // Check if setlist exists and belongs to user
  const existingSetlist = await prisma.setlist.findFirst({
    where: {
      id: setlistId,
      userId: req.user.id
    }
  });

  if (!existingSetlist) {
    return res.status(404).json({
      success: false,
      message: 'Setlist not found'
    });
  }

  const setlist = await prisma.setlist.update({
    where: { id: setlistId },
    data: { name },
    include: {
      _count: {
        select: {
          setlistSongs: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Setlist updated successfully',
    data: { setlist }
  });
}));

// Delete setlist
router.delete('/:id', idValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const setlistId = parseInt(req.params.id);

  // Check if setlist exists and belongs to user
  const existingSetlist = await prisma.setlist.findFirst({
    where: {
      id: setlistId,
      userId: req.user.id
    }
  });

  if (!existingSetlist) {
    return res.status(404).json({
      success: false,
      message: 'Setlist not found'
    });
  }

  // Delete setlist (this will cascade delete setlistSongs due to schema)
  await prisma.setlist.delete({
    where: { id: setlistId }
  });

  res.json({
    success: true,
    message: 'Setlist deleted successfully'
  });
}));

// Add song to setlist
router.post('/:id/songs', [...idValidation, ...addSongValidation], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const setlistId = parseInt(req.params.id);
  const { songId, order } = req.body;

  // Check if setlist exists and belongs to user
  const setlist = await prisma.setlist.findFirst({
    where: {
      id: setlistId,
      userId: req.user.id
    }
  });

  if (!setlist) {
    return res.status(404).json({
      success: false,
      message: 'Setlist not found'
    });
  }

  // Check if song exists and belongs to user
  const song = await prisma.song.findFirst({
    where: {
      id: songId,
      userId: req.user.id
    }
  });

  if (!song) {
    return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
  }

  // Check if song is already in setlist
  const existingSetlistSong = await prisma.setlistSong.findFirst({
    where: {
      setlistId,
      songId
    }
  });

  if (existingSetlistSong) {
    return res.status(400).json({
      success: false,
      message: 'Song is already in this setlist'
    });
  }

  // Get the next order number if not provided
  let finalOrder = order;
  if (!finalOrder) {
    const lastSong = await prisma.setlistSong.findFirst({
      where: { setlistId },
      orderBy: { order: 'desc' }
    });
    finalOrder = lastSong ? lastSong.order + 1 : 1;
  }

  // If order is specified and conflicts, shift other songs
  if (order) {
    await prisma.setlistSong.updateMany({
      where: {
        setlistId,
        order: { gte: order }
      },
      data: {
        order: { increment: 1 }
      }
    });
  }

  const setlistSong = await prisma.setlistSong.create({
    data: {
      setlistId,
      songId,
      order: finalOrder
    },
    include: {
      song: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Song added to setlist successfully',
    data: { setlistSong }
  });
}));

// Remove song from setlist
router.delete('/:id/songs/:songId', [
  ...idValidation,
  param('songId').isInt({ min: 1 }).withMessage('Invalid song ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const setlistId = parseInt(req.params.id);
  const songId = parseInt(req.params.songId);

  // Check if setlist exists and belongs to user
  const setlist = await prisma.setlist.findFirst({
    where: {
      id: setlistId,
      userId: req.user.id
    }
  });

  if (!setlist) {
    return res.status(404).json({
      success: false,
      message: 'Setlist not found'
    });
  }

  // Find and delete the setlist song
  const setlistSong = await prisma.setlistSong.findFirst({
    where: {
      setlistId,
      songId
    }
  });

  if (!setlistSong) {
    return res.status(404).json({
      success: false,
      message: 'Song not found in setlist'
    });
  }

  await prisma.setlistSong.delete({
    where: { id: setlistSong.id }
  });

  // Reorder remaining songs
  await prisma.setlistSong.updateMany({
    where: {
      setlistId,
      order: { gt: setlistSong.order }
    },
    data: {
      order: { decrement: 1 }
    }
  });

  res.json({
    success: true,
    message: 'Song removed from setlist successfully'
  });
}));

// Reorder songs in setlist
router.put('/:id/reorder', [
  ...idValidation,
  body('songOrders')
    .isArray({ min: 1 })
    .withMessage('songOrders must be a non-empty array'),
  body('songOrders.*.songId')
    .isInt({ min: 1 })
    .withMessage('Each songOrder must have a valid songId'),
  body('songOrders.*.order')
    .isInt({ min: 1 })
    .withMessage('Each songOrder must have a valid order')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const setlistId = parseInt(req.params.id);
  const { songOrders } = req.body;

  // Check if setlist exists and belongs to user
  const setlist = await prisma.setlist.findFirst({
    where: {
      id: setlistId,
      userId: req.user.id
    }
  });

  if (!setlist) {
    return res.status(404).json({
      success: false,
      message: 'Setlist not found'
    });
  }

  // Update all song orders in a transaction using delete-and-recreate approach
  await prisma.$transaction(async (tx) => {
    // Delete all existing setlistSong entries for this setlist
    await tx.setlistSong.deleteMany({
      where: { setlistId }
    });

    // Recreate all entries with new order values
    const newEntries = songOrders.map(({ songId, order }) => ({
      setlistId,
      songId,
      order
    }));

    await tx.setlistSong.createMany({
      data: newEntries
    });
  });

  res.json({
    success: true,
    message: 'Setlist reordered successfully'
  });
}));

module.exports = router;
