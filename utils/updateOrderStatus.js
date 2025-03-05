const Order = require('../model/order.model.js'); // Імпорт моделі замовлення

const updateOrderStatus = async (orderRef, status) => {
    try {
        const order = await Order.findOne({ orderId: orderRef });

        if (!order) {
            console.log(`❌ Замовлення з order_ref ${orderRef} не знайдено.`);
            return { success: false, message: "Order not found" };
        }

        order.status = status; // Оновлення статусу
        await order.save(); // Збереження змін

        console.log(`✅ Статус замовлення ${orderRef} оновлено до: ${status}`);
        return { success: true, message: "Order updated successfully" };

    } catch (error) {
        console.error("❌ Помилка при оновленні статусу замовлення:", error.message);
        return { success: false, message: "Server error" };
    }
};

module.exports = updateOrderStatus;
