import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Use the latest supported version
});

export async function POST(req: Request) {
  const { priceId, userId, userEmail, userName } = await req.json();

  try {
    // First, check if the user already has a Stripe customer ID
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    let customerId: string;

    if (userData?.stripeCustomerId) {
      // If the user already has a Stripe customer ID, use it
      customerId = userData.stripeCustomerId;
    } else {
      // If not, create a new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;

      // Update Firestore with the new Stripe customer ID
      await updateDoc(userRef, {
        stripeCustomerId: customerId,
      });
    }

    // Check if the customer already has an active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    if (subscriptions.data.length > 0) {
      // Customer already has an active subscription
      return NextResponse.json({ error: "Customer already has an active subscription" }, { status: 400 });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/canceled`,
      customer: customerId,
      client_reference_id: userId,
      // customer_email: userEmail,
      metadata: {
        userId,
        userName,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Error creating checkout session" }, { status: 500 });
  }
}