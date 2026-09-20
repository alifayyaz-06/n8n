/**
 * Multi-Tenant Order Controller - Express Request & Response Handlers
 */

import { orderService } from '../services/orderService.js';
import { sendOrderStatusWebhook } from '../services/n8nService.js';
import { ORDER_STATUSES } from '../models/orderModel.js';

export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const restaurantId = req.restaurantId;
    const orders = await orderService.getAllOrders(restaurantId, status);
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders from database.',
      error: 'DATABASE_ERROR',
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    const order = await orderService.getOrderById(id, restaurantId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${id}' was not found for this restaurant.`,
        error: 'ORDER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.',
      error: 'DATABASE_ERROR',
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customerName, items } = req.body;
    const restaurantId = req.restaurantId;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. customerName and at least 1 order item are required.',
        error: 'INVALID_REQUEST_BODY',
      });
    }

    const newOrder = await orderService.createOrder(req.body, restaurantId);
    return res.status(201).json({
      success: true,
      message: 'Order created successfully in database.',
      data: newOrder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create order in database.',
      error: 'DATABASE_ERROR',
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const restaurantId = req.restaurantId;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required in request body.',
        error: 'MISSING_STATUS_FIELD',
      });
    }

    const validStatuses = Object.values(ORDER_STATUSES);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value '${status}'. Allowed statuses: ${validStatuses.join(', ')}`,
        error: 'INVALID_STATUS_VALUE',
      });
    }

    const result = await orderService.updateOrderStatus(id, restaurantId, status, rejectionReason);

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: result.message,
          error: 'ORDER_NOT_FOUND',
        });
      }

      if (result.code === 'INVALID_TRANSITION') {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: 'INVALID_STATUS_TRANSITION',
        });
      }
    }

    // Trigger n8n webhook after successful database status update
    sendOrderStatusWebhook(result.order).catch((err) => {
      console.warn('⚠️ Webhook trigger background error:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}' successfully.`,
      data: result.order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status in database.',
      error: 'DATABASE_ERROR',
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    const deleted = await orderService.deleteOrder(id, restaurantId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${id}' not found.`,
        error: 'ORDER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order '${id}' deleted successfully from database.`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete order from database.',
      error: 'DATABASE_ERROR',
    });
  }
};
