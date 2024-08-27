import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/firebase/firebaseConfig";
import { doc, updateDoc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Use the latest supported version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    // Add other event types as needed
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Retrieve the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get the Firebase user ID from the client_reference_id
  const userId = session.client_reference_id!;

  // Update Firestore
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    await updateDoc(userRef, {
      tier: "pro",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      subscriptionStartDate: new Date(subscription.current_period_start * 1000),
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    });
  } else {
    console.error(`User document not found for userId: ${userId}`);
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Find the user with this Stripe customer ID
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('stripeCustomerId', '==', customerId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error(`No user found with Stripe customer ID: ${customerId}`);
    return;
  }

  const userDoc = querySnapshot.docs[0];
  const userId = userDoc.id;

  // Update Firestore
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    tier: "free",
    subscriptionStatus: "cancelled",
    stripeSubscriptionId: null,
    subscriptionEndDate: new Date(),
  });

  console.log(`Subscription cancelled for user: ${userId}`);
}