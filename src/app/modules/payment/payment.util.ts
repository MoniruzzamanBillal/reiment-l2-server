import axios from "axios";
import config from "../../config";

interface TPaymentData {
  transactionId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  userId: string;
}

const redirectLink =
  "https://reiment-l2-server.vercel.app/?vercelToolbarCode=C5yRO2za5aUWWbd/api";
// const redirectLink = "http://localhost:5000/api";
// const cancelUrl = "http://localhost:3000/";
const cancelUrl = "https://reiment-l2-client.vercel.app/";

export const initiatePayment = async (paymentData: TPaymentData) => {
  const result = await axios.post(process.env.PAYMENT_URL!, {
    tran_id: `${paymentData.transactionId}`,
    store_id: config.STORE_ID,
    signature_key: config.SIGNATURE_KEY,
    success_url: `${redirectLink}/payment/confirmation?transactionId=${paymentData.transactionId}&userId=${paymentData?.userId}`,
    fail_url: `${redirectLink}/payment/cancel-payment`,
    cancel_url: cancelUrl,
    amount: paymentData.amount,
    currency: "BDT",
    desc: "Merchant Registration Payment",
    cus_name: paymentData.customerName,
    cus_email: paymentData.customerEmail,
    cus_add1: "N/A",
    cus_add2: "N/A",
    cus_city: "N/A",
    cus_state: "N/A",
    cus_postcode: "N/A",
    cus_country: "N/A",
    cus_phone: "N/A",
    type: "json",
  });

  return result.data;
};

// ! for verifying payment
export const verifyPay = async (trnxID: string) => {
  try {
    const result = await axios.get(config.PAYMENT_Check_URL!, {
      params: {
        request_id: trnxID,
        store_id: config.STORE_ID,
        signature_key: config.SIGNATURE_KEY,
        type: "json",
      },
    });

    return result?.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
