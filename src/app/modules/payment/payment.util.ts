import axios from "axios";
import QueryString from "qs";
import config from "../../config";

// const redirectLink = "https://reiment-l2-server.vercel.app/api";
// const redirectLink = "http://localhost:5000/api";
// const cancelUrl = "http://localhost:3000/";
// const cancelUrl = "https://reiment-l2-client.vercel.app/";

interface TPaymentData {
  transactionId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  userId: string;
}

// ! for initializing payment
export const initPayment = async (payload: TPaymentData) => {
  try {
    const data = {
      store_id: config.STORE_ID,
      store_passwd: config.STORE_PASSWORD,
      total_amount: payload?.amount,
      currency: "BDT",
      tran_id: payload?.transactionId,
      // success_url: config.SUCCESS_URL,
      success_url: "https://reiment-l2-server.vercel.app/api/payment/success",
      // success_url: "http://localhost:5000/api/payment/success",
      fail_url: config.FAIL_URL,
      cancel_url: config.CANCEL_URL,
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "Courier",
      product_name: "dummy product",
      product_category: "category",
      product_profile: "general",
      cus_name: payload?.customerName,
      cus_email: payload?.customerEmail,
      cus_add1: "N/A",
      cus_add2: "N/A",
      cus_city: "N/A",
      cus_state: "N/A",
      cus_postcode: "N/A",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      ship_name: payload?.customerName,
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    // const response = await axios({
    //   method: "post",
    //   // url: config.SSL_PAYMENT_URL,
    //   url: "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
    //   data,
    //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // });

    const response = await axios.post(
      config?.SSL_PAYMENT_URL as string,
      QueryString.stringify(data),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response?.data?.desc[6]?.redirectGatewayURL;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};
