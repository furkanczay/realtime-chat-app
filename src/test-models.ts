import prisma from "@/lib/prisma";

// Test function to check available models
export async function testModels() {
  console.log("Available models:", Object.getOwnPropertyNames(prisma));

  try {
    const users = await prisma.user.findMany();
    console.log("Users table accessible");

    const messages = await prisma.message.findMany();
    console.log("Messages table accessible");

    const friendships = await prisma.friendship.findMany();
    console.log("Friendships table accessible");

    const friendRequests = await prisma.friendRequest.findMany();
    console.log("FriendRequests table accessible");
  } catch (error) {
    console.error("Error accessing models:", error);
  }
}
