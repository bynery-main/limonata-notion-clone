import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const { userId } = await req.json();

  try {
    // Get the user's document from Firestore
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData.stripeCustomerId;
    const stripeSubscriptionId = userData.stripeSubscriptionId;

    if (!stripeCustomerId || !stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update the user's document in Firestore
    await updateDoc(userRef, {
      subscriptionStatus: "active_pending_cancellation",
      subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    return NextResponse.json({ message: "Subscription cancelled successfully", subscription });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ error: "Error cancelling subscription" }, { status: 500 });
  }
}