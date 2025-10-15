import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLBoolean } from "graphql";
import Task from "../models/Task";
import User from "../models/User";

// Task Type
const TaskType = new GraphQLObjectType({
  name: "Task",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
    user: {
      type: GraphQLString, // Just show email for simplicity
      resolve(parent) {
        return parent.user?.email || parent.user?.toString() || "";
      }
    }
  }),
});

// Query Root
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    tasks: {
      type: new GraphQLList(TaskType),
      args: {
        userId: { type: GraphQLID }
      },
      async resolve(parent, args, context) {
        // Only allow logged-in users
        if (!context.user) throw new Error("Not authenticated");
        // If admin, allow filtering; if user, only own tasks
        if (context.user.role === "admin" && args.userId) {
          return Task.find({ user: args.userId });
        }
        if (context.user.role === "admin") {
          return Task.find();
        }
        return Task.find({ user: context.user.userId });
      }
    },
    hello: {
      type: GraphQLString,
      resolve() {
        return "Hello from GraphQL!";
      }
    }
  }
});

// Mutations Example: Create Task
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createTask: {
      type: TaskType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString }
      },
      async resolve(parent, args, context) {
        if (!context.user) throw new Error("Not authenticated");
        const newTask = new Task({
          title: args.title,
          description: args.description,
          user: context.user.userId
        });
        return await newTask.save();
      }
    }
  }
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});