const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../model/order.model.js');
const updateOrderStatus = require('../utils/updateOrderStatus.js');

const { MONO_CHECKOUT_URL } = require('../constants.js');



//Mono checkout
router.post('/', async (req, res) => {
	const body = req.body;
	try { 
		const checkoutOrderBody = {
  "order_ref": body.order_ref,
  "amount": body.amount,
  "ccy": 980,
  "count": 1,
  "products": [
    {
      "name": body.name,
      "cnt": 1,
      "price": body.price,
      "code_product": body.code_product,
      //"code_checkbox": "3315974",
      "product_img_src": body.img
    }
  ],
  "dlv_method_list": [
    "np_brnm"
  ],
  "payment_method_list": [
    "card"
  ],
  "dlv_pay_merchant": false,
  "callback_url": "https://1cd2-2a02-2378-134e-c059-3803-2466-ac77-55f1.ngrok-free.app/checkout/callback",
  "return_url": "http://localhost:5173",
	"hold": true,
	"fl_recall": true
		}
		
		
		const newOrder = await axios.post(MONO_CHECKOUT_URL + "order", checkoutOrderBody , {
			headers: {
				'Content-Type': 'application/json',
				'X-Token': process.env.MONO_CHECKOUT_TOKEN
			}
		});
		res.json(newOrder.data);
		console.log(newOrder.data);

	} catch (error) {
		res.status(500).json({ message: "Server error: " + error.message });
	}
})

 
const MONO_SECRET = process.env.MONO_CHECKOUT_TOKEN;

if (!MONO_SECRET) {
    console.error("❌ Помилка: MONO_SECRET не встановлено!");
    process.exit(1);
}

router.get('/order-data', async (req, res) => { 
  try {
    const { order_ref } = req.query;

    if (!order_ref) {
      return res.status(400).json({ message: "Missing order_ref parameter" });
    }

    console.log(`Fetching order data for: ${order_ref}`);

    const orderData = await axios.get(`${MONO_CHECKOUT_URL}order/${order_ref}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Token': process.env.MONO_CHECKOUT_TOKEN
      }
    });

    console.log("Order Data:", orderData.data);
    return res.json(orderData.data);

  } catch (error) {
    console.error("Error fetching order data:", error.message);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
});


router.post('/checkout/callback', async (req, res) => {
    try {
        const signatureBase64 = req.headers['x-sign']; // Отримуємо підпис від MonoBank
        if (!signatureBase64) {
            return res.status(400).json({ message: "Missing X-Sign header" });
				}
			console.log("✅ Підпис отримано:", signatureBase64);
			

        const body = JSON.stringify(req.body);

        // 🔹 Отримуємо відкритий ключ від MonoBank
        const response = await axios.get(MONO_CHECKOUT_URL + "signature/public/key", {
            headers: { 'X-Token': MONO_SECRET }
        });

        const publicKeyBase64 = response.data.key;
        if (!publicKeyBase64) {
            console.error("❌ Помилка: Не вдалося отримати публічний ключ!");
            return res.status(500).json({ message: "Failed to retrieve public key" });
				}
			console.log("✅ Публічний ключ отримано:", publicKeyBase64);
			

        // 🔹 Перетворюємо підпис і ключ у Buffer
        const signatureBuf = Buffer.from(signatureBase64, 'base64');
        const publicKeyBuf = Buffer.from(publicKeyBase64, 'base64');

        // 🔹 Перевіряємо підпис через ECDSA
        const verify = crypto.createVerify('sha256');
        verify.write(body);
        verify.end();

        const isValid = verify.verify(publicKeyBuf, signatureBuf);

        if (!isValid) {
            console.error("❌ Помилка: Недійсний підпис!");
            return res.status(401).json({ message: "Invalid signature" });
        }

			console.log("✅ Підпис валідний! Callback отримано:", req.body);

			
			const { orderId, generalStatus} = req.body;
			const newOrder = await Order.create(req.body);
			
				
				console.log(`🟡 order_ref: ${orderId}, status: ${generalStatus}`);
        // 🔹 Оновлення статусу замовлення
        try {
            switch (generalStatus) {
                case "success":
                    console.log(`✅ Замовлення ${orderId} успішно оплачене!`);
                    await updateOrderStatus(orderId, 'paid');
                    break;
                case "fail":
                    console.log(`❌ Замовлення ${orderId} НЕ оплачене.`);
                    await updateOrderStatus(orderId, 'failed');
                    break;
                case "hold":
                    console.log(`🔸 Замовлення ${orderId} на холді (очікування оплати).`);
                    await updateOrderStatus(orderId, 'on_hold');
                    break;
                case "refund":
                    console.log(`🔹 Замовлення ${orderId} повернене.`);
                    await updateOrderStatus(orderId, 'refunded');
                    break;
                default:
                    console.log(`ℹ️ Отримано статус ${generalStatus} для замовлення ${orderId}.`);
                    await updateOrderStatus(orderId, generalStatus);
                    break;
            }
        } catch (error) {
            console.error(`❌ Помилка при оновленні статусу замовлення ${orderId}:`, error.message);
        }

        res.status(200).json({ message: "Callback processed" });

    } catch (error) {
        console.error("❌ Помилка в обробці callback:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;