const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../db');

// GET /api/raci-tracker/my-assignments?page=1&pageSize=10
router.get('/my-assignments', protect, async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;

    const countResult = await db.query(
      `SELECT COUNT(*) FROM raci_assignments WHERE user_id = $1`,
      [userId]
    );
    const totalItems = parseInt(countResult.rows[0].count);

    const { rows } = await db.query(
      `SELECT ra.id, ra.role, ra.financial_limits, 
              t.task_id, t.name as task_name, t.description as task_description,
              e.event_id, e.name as event_name, e.start_date, e.end_date,
              d.department_id, d.name as department_name
         FROM raci_assignments ra
         JOIN tasks t ON ra.task_id = t.task_id
         JOIN events e ON ra.event_id = e.event_id
         JOIN departments d ON e.department_id = d.department_id
        WHERE ra.user_id = $1
        ORDER BY ra.id DESC
        LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    );

    const assignments = rows.map(row => ({
      id: row.id,
      role: row.role,
      financialLimits: row.financial_limits ? JSON.parse(row.financial_limits) : null,
      task: {
        id: row.task_id,
        name: row.task_name,
        description: row.task_description
      },
      event: {
        id: row.event_id,
        name: row.event_name,
        startDate: row.start_date,
        endDate: row.end_date
      },
      department: {
        id: row.department_id,
        name: row.department_name
      }
    }));

    res.status(200).json({
      success: true,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
