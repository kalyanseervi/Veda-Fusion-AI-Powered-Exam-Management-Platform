const express = require('express');
const router = express.Router();
const { Role, User } = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Create a new role
router.post('/roles', auth, authorize('admin'), async (req, res) => {
    const { name, permissions } = req.body;

    try {
        let role = new Role({ name, permissions });
        await role.save();

        res.status(201).json({ msg: 'Role created successfully', role });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update a role's permissions
router.put('/roles/:roleId', auth, authorize('admin'), async (req, res) => {
    const { permissions } = req.body;

    try {
        let role = await Role.findById(req.params.roleId);
        if (!role) {
            return res.status(404).json({ msg: 'Role not found' });
        }

        role.permissions = permissions;
        await role.save();

        res.status(200).json({ msg: 'Role updated successfully', role });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a role
router.delete('/roles/:roleId', auth, authorize('admin'), async (req, res) => {
    try {
        let role = await Role.findById(req.params.roleId);
        if (!role) {
            return res.status(404).json({ msg: 'Role not found' });
        }

        await role.remove();

        res.status(200).json({ msg: 'Role deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Assign a role to a user
router.put('/users/:userId/role', auth, authorize('admin'), async (req, res) => {
    const { roleId } = req.body;

    try {
        let user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        let role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ msg: 'Role not found' });
        }

        user.role = roleId;
        await user.save();

        res.status(200).json({ msg: 'Role assigned successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Remove a role from a user
router.put('/users/:userId/role/remove', auth, authorize('admin'), async (req, res) => {
    try {
        let user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.role = null;
        await user.save();

        res.status(200).json({ msg: 'Role removed successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
