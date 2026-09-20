/**
 * Multi-Tenant Rider Controller - Express Handlers for Rider Operations
 */

import { riderService } from '../services/riderService.js';
import { orderService } from '../services/orderService.js';

export const getRiders = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const riders = await riderService.getAllRiders(restaurantId);
    const totalPendingCash = riders.reduce((sum, r) => sum + (r.pendingAmount || 0), 0);
    
    return res.status(200).json({
      success: true,
      count: riders.length,
      totalPendingCash,
      data: riders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve riders list.',
      error: err.message,
    });
  }
};

export const createRider = async (req, res) => {
  try {
    const { name, phone, vehicle, status } = req.body;
    const restaurantId = req.restaurantId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Rider name is required.',
      });
    }

    const rider = await riderService.createRider({ name, phone, vehicle, status }, restaurantId);
    return res.status(201).json({
      success: true,
      message: 'Rider created successfully in Supabase.',
      data: rider,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create rider.',
      error: err.message,
    });
  }
};

export const updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicle, status } = req.body;
    const restaurantId = req.restaurantId;

    const result = await riderService.updateRider(id, restaurantId, { name, phone, vehicle, status });
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rider updated successfully in Supabase.',
      data: result.rider,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update rider.',
      error: err.message,
    });
  }
};

export const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    const deleted = await riderService.deleteRider(id, restaurantId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Rider '${id}' not found for this restaurant.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Rider '${id}' deleted successfully from Supabase database.`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete rider.',
      error: err.message,
    });
  }
};

export const assignRiderToOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { riderId, riderName } = req.body;
    const restaurantId = req.restaurantId;

    if (!riderId || !riderName) {
      return res.status(400).json({
        success: false,
        message: 'riderId and riderName are required.',
      });
    }

    const result = await orderService.assignRider(orderId, restaurantId, riderId, riderName);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Rider '${riderName}' assigned to order '${orderId}'.`,
      data: result.order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to assign rider to order.',
      error: err.message,
    });
  }
};

export const settleRiderBalance = async (req, res) => {
  try {
    const { id: riderId } = req.params;
    const restaurantId = req.restaurantId;
    const result = await riderService.settleRiderBalance(riderId, restaurantId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to settle rider balance.',
      error: err.message,
    });
  }
};
