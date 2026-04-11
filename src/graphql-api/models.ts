import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Application user without password data.' })
export class UserModel {
  @Field(() => Int, { description: 'Unique user identifier.' })
  id!: number;

  @Field({ description: 'User display name.' })
  name!: string;

  @Field({ description: 'User email address.' })
  email!: string;

  @Field(() => [PostModel], {
    description: 'Posts created by this user.',
    nullable: true,
  })
  posts?: PostModel[];

  @Field(() => [EventModel], {
    description: 'Events authored by this user.',
    nullable: true,
  })
  authoredEvents?: EventModel[];

  @Field(() => [ReviewModel], {
    description: 'Reviews created by this user.',
    nullable: true,
  })
  reviews?: ReviewModel[];

  @Field(() => [NotificationModel], {
    description: 'Notifications addressed to this user.',
    nullable: true,
  })
  notifications?: NotificationModel[];
}

@ObjectType({ description: 'Post about an event or place.' })
export class PostModel {
  @Field(() => Int, { description: 'Unique post identifier.' })
  id!: number;

  @Field({ description: 'Post title.' })
  title!: string;

  @Field({ description: 'Post description.' })
  desc!: string;

  @Field(() => GraphQLISODateTime, { description: 'Post event date.' })
  date!: Date;

  @Field({ description: 'Post event location.' })
  place!: string;

  @Field(() => Int, { description: 'Identifier of the post author.' })
  authorId!: number;

  @Field(() => Int, {
    description: 'Optional category identifier.',
    nullable: true,
  })
  categoryId?: number | null;

  @Field(() => GraphQLISODateTime, { description: 'Post creation date.' })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, { description: 'Post last update date.' })
  updatedAt!: Date;

  @Field(() => UserModel, {
    description: 'User who created this post.',
    nullable: true,
  })
  author?: UserModel;

  @Field(() => [ReviewModel], {
    description: 'Reviews written for this post.',
    nullable: true,
  })
  reviews?: ReviewModel[];
}

@ObjectType({ description: 'Event created by a user and shared with users.' })
export class EventModel {
  @Field(() => Int, { description: 'Unique event identifier.' })
  id!: number;

  @Field({ description: 'Event title.' })
  title!: string;

  @Field({ description: 'Event description.' })
  desc!: string;

  @Field(() => GraphQLISODateTime, { description: 'Event date and time.' })
  date!: Date;

  @Field({ description: 'Event location.' })
  place!: string;

  @Field(() => Int, { description: 'Identifier of the event author.' })
  authorId!: number;

  @Field(() => UserModel, {
    description: 'User who created this event.',
    nullable: true,
  })
  author?: UserModel;

  @Field(() => [UserModel], {
    description: 'Users registered for this event.',
    nullable: true,
  })
  participants?: UserModel[];
}

@ObjectType({ description: 'Review left by a user for a post.' })
export class ReviewModel {
  @Field(() => Int, { description: 'Unique review identifier.' })
  id!: number;

  @Field({ description: 'Review text.' })
  content!: string;

  @Field(() => Int, {
    description: 'Optional rating from 1 to 5.',
    nullable: true,
  })
  rating?: number | null;

  @Field(() => Int, { description: 'Identifier of the review author.' })
  authorId!: number;

  @Field(() => Int, { description: 'Identifier of the reviewed post.' })
  postId!: number;

  @Field(() => GraphQLISODateTime, { description: 'Review creation date.' })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, { description: 'Review last update date.' })
  updatedAt!: Date;

  @Field(() => UserModel, {
    description: 'User who wrote this review.',
    nullable: true,
  })
  author?: UserModel;

  @Field(() => PostModel, {
    description: 'Post that received this review.',
    nullable: true,
  })
  post?: PostModel;
}

@ObjectType({ description: 'Notification sent to a user.' })
export class NotificationModel {
  @Field(() => Int, { description: 'Unique notification identifier.' })
  id!: number;

  @Field(() => Int, {
    description: 'Identifier of the notification recipient.',
  })
  userId!: number;

  @Field({ description: 'Notification message.' })
  message!: string;

  @Field({ description: 'Whether the notification was read.' })
  isRead!: boolean;

  @Field(() => GraphQLISODateTime, {
    description: 'Notification creation date.',
  })
  createdAt!: Date;

  @Field(() => UserModel, {
    description: 'User who received this notification.',
    nullable: true,
  })
  user?: UserModel;
}

@ObjectType({ description: 'Authentication operation result.' })
export class AuthResultModel {
  @Field(() => Int, { description: 'Identifier of the authenticated user.' })
  userId!: number;
}
