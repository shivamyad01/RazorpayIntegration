import React, { useState } from 'react';
import axios from 'axios';
import './Payment.css'; // Import the CSS file

const Payment = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleAutoPay = async () => {
    if (!name || !mobile) {
      alert('Please enter both name and mobile number');
      return;
    }

    try {
      const autoPayUrl = 'http://localhost:5001/api/payment/auto-pay'; // Update URL as per your backend
      const response = await axios.post(autoPayUrl, { name, mobile });
      const { data } = response;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Use the environment variable
        amount: data.amount,
        currency: data.currency,
        name: 'Solution World 24x7',
        description: 'Auto Payment of Rs. 1',
        image: 'https://example.com/your_logo',
        order_id: data.id,
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id;
          const orderId = response.razorpay_order_id;
          const signature = response.razorpay_signature;
          const verifyUrl = 'http://localhost:5001/api/payment/verify'; // Update URL as per your backend

          const verifyResponse = await axios.post(verifyUrl, {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            amount: data.amount,
            name: name,
            mobile: mobile,
          });

          if (verifyResponse.data.status === 'success') {
            setReceipt({
              orderId: verifyResponse.data.receipt.orderId,
              paymentId: verifyResponse.data.receipt.paymentId,
              amount: verifyResponse.data.receipt.amount,
              name: verifyResponse.data.receipt.name,
              mobile: verifyResponse.data.receipt.mobile,
              status: 'success',
            });
            alert('Auto payment successful');
          } else {
            alert('Auto payment verification failed');
          }
        },
        prefill: {
          name: name,
          email: 'youremail@example.com',
          contact: mobile,
        },
        notes: {
          address: 'Your Company Address',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Auto payment error: ', error);
      alert('Auto payment error. Please try again.');
    }
  };

  return (
    <div className="payment-container">
      <h1>Razorpay Auto Payment</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Enter your mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="input-field"
        />
      </div>
      <button onClick={handleAutoPay} className="pay-button">Pay Rs. 1 Now</button>

      {receipt && (
        <div className="receipt-container">
          <h2>Payment Receipt</h2>
          <p>Order ID: {receipt.orderId}</p>
          <p>Payment ID: {receipt.paymentId}</p>
          <p>Amount: Rs. {receipt.amount / 100}</p>
          <p>Name: {receipt.name}</p>
          <p>Mobile: {receipt.mobile}</p>
          <p>Status: {receipt.status}</p>
        </div>
      )}
    </div>
  );
};

export default Payment;
