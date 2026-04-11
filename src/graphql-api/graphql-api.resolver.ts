import { NotFoundException } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { EventsService } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostsService } from 'src/posts/posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { UsersService } from 'src/users/users.service';
import {
  CreateEventInput,
  CreateNotificationInput,
  CreatePostInput,
  CreateReviewInput,
  LoginInput,
  RegisterUserInput,
  UpdateEventInput,
  UpdatePostInput,
  UpdateReviewInput,
} from './inputs';
import {
  AuthResultModel,
  EventModel,
  NotificationModel,
  PostModel,
  ReviewModel,
  UserModel,
} from './models';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const listComplexity = ({ args, childComplexity }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const limit = normalizeLimit(args.limit ?? DEFAULT_PAGE_SIZE);
  return limit * childComplexity + 1;
};

function normalizePage(page = 1): number {
  return Math.max(1, page);
}

function normalizeLimit(limit = DEFAULT_PAGE_SIZE): number {
  return Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
}

function pagination(page?: number, limit?: number) {
  const normalizedLimit = normalizeLimit(limit);
  const normalizedPage = normalizePage(page);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
}

@Resolver()
export class GraphqlApiResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly postsService: PostsService,
    private readonly prisma: PrismaService,
    private readonly reviewsService: ReviewsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => [PostModel], {
    description: 'Get posts list with pagination.',
    complexity: listComplexity,
  })
  posts(
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
    @Args('search', {
      nullable: true,
      description: 'Case-insensitive title fragment.',
    })
    search?: string,
  ) {
    const params = pagination(page, limit);
    return this.postsService.findAll(params.page, params.limit, search);
  }

  @Query(() => PostModel, {
    description: 'Get a post by identifier.',
    nullable: true,
  })
  post(
    @Args('id', {
      type: () => Int,
      description: 'Post identifier.',
    })
    id: number,
  ) {
    return this.postsService.findOne(id);
  }

  @Query(() => [EventModel], {
    description: 'Get events visible to a user with pagination.',
    complexity: listComplexity,
  })
  events(
    @Args('userId', {
      type: () => Int,
      description: 'Identifier of the current user.',
    })
    userId: number,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.eventsService.findAll(userId, params.page, params.limit);
  }

  @Query(() => EventModel, {
    description: 'Get an event by identifier.',
    nullable: true,
  })
  event(
    @Args('id', {
      type: () => Int,
      description: 'Event identifier.',
    })
    id: number,
  ) {
    return this.eventsService.findOne(id);
  }

  @Query(() => [ReviewModel], {
    description: 'Get reviews list with pagination.',
    complexity: listComplexity,
  })
  reviews(
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.reviewsService.findAll(params.page, params.limit);
  }

  @Query(() => ReviewModel, {
    description: 'Get a review by identifier.',
    nullable: true,
  })
  review(
    @Args('id', {
      type: () => Int,
      description: 'Review identifier.',
    })
    id: number,
  ) {
    return this.reviewsService.findOne(id);
  }

  @Query(() => [NotificationModel], {
    description: 'Get notifications addressed to a user with pagination.',
    complexity: listComplexity,
  })
  notifications(
    @Args('userId', {
      type: () => Int,
      description: 'Identifier of the notification recipient.',
    })
    userId: number,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.notificationsService.findAll(userId, params.page, params.limit);
  }

  @Query(() => NotificationModel, {
    description: 'Get a notification by identifier.',
    nullable: true,
  })
  notification(
    @Args('id', {
      type: () => Int,
      description: 'Notification identifier.',
    })
    id: number,
  ) {
    return this.notificationsService.findOne(id);
  }

  @Query(() => UserModel, {
    description: 'Get a user by identifier.',
    nullable: true,
  })
  async user(
    @Args('id', {
      type: () => Int,
      description: 'User identifier.',
    })
    id: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Query(() => [UserModel], {
    description: 'Search users by email fragment.',
    complexity: listComplexity,
  })
  searchUsers(
    @Args('email', {
      description: 'Case-insensitive email fragment.',
    })
    email: string,
  ) {
    return this.usersService.searchByEmail(email);
  }

  @Mutation(() => AuthResultModel, {
    description: 'Register a new user account.',
  })
  registerUser(
    @Args('input', { description: 'User registration data.' })
    input: RegisterUserInput,
  ) {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResultModel, {
    description: 'Log in with email and password.',
  })
  loginUser(
    @Args('input', { description: 'User login data.' })
    input: LoginInput,
  ) {
    return this.authService.login(input);
  }

  @Mutation(() => PostModel, { description: 'Create a post.' })
  createPost(
    @Args('input', { description: 'Post creation data.' })
    input: CreatePostInput,
  ) {
    return this.postsService.create(input);
  }

  @Mutation(() => PostModel, { description: 'Update a post.' })
  updatePost(
    @Args('id', { type: () => Int, description: 'Post identifier.' })
    id: number,
    @Args('input', { description: 'Post fields to change.' })
    input: UpdatePostInput,
  ) {
    return this.postsService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a post.' })
  async deletePost(
    @Args('id', { type: () => Int, description: 'Post identifier.' })
    id: number,
  ) {
    await this.postsService.remove(id);
    return true;
  }

  @Mutation(() => EventModel, { description: 'Create an event.' })
  createEvent(
    @Args('authorId', {
      type: () => Int,
      description: 'Identifier of the event author.',
    })
    authorId: number,
    @Args('input', { description: 'Event creation data.' })
    input: CreateEventInput,
  ) {
    return this.eventsService.create(authorId, input);
  }

  @Mutation(() => EventModel, { description: 'Update an event.' })
  updateEvent(
    @Args('id', { type: () => Int, description: 'Event identifier.' })
    id: number,
    @Args('authorId', {
      type: () => Int,
      description: 'Identifier of the event author.',
    })
    authorId: number,
    @Args('input', { description: 'Event fields to change.' })
    input: UpdateEventInput,
  ) {
    return this.eventsService.update(id, authorId, input);
  }

  @Mutation(() => EventModel, { description: 'Delete an event.' })
  deleteEvent(
    @Args('id', { type: () => Int, description: 'Event identifier.' })
    id: number,
  ) {
    return this.eventsService.remove(id);
  }

  @Mutation(() => ReviewModel, { description: 'Create a review.' })
  createReview(
    @Args('input', { description: 'Review creation data.' })
    input: CreateReviewInput,
  ) {
    return this.reviewsService.create(input);
  }

  @Mutation(() => ReviewModel, { description: 'Update a review.' })
  updateReview(
    @Args('id', { type: () => Int, description: 'Review identifier.' })
    id: number,
    @Args('userId', {
      type: () => Int,
      description: 'Identifier of the review author.',
    })
    userId: number,
    @Args('input', { description: 'Review fields to change.' })
    input: UpdateReviewInput,
  ) {
    return this.reviewsService.update(id, userId, input);
  }

  @Mutation(() => ReviewModel, { description: 'Delete a review.' })
  deleteReview(
    @Args('id', { type: () => Int, description: 'Review identifier.' })
    id: number,
  ) {
    return this.reviewsService.remove(id);
  }

  @Mutation(() => NotificationModel, { description: 'Create a notification.' })
  createNotification(
    @Args('input', { description: 'Notification creation data.' })
    input: CreateNotificationInput,
  ) {
    return this.notificationsService.create(input);
  }

  @Mutation(() => NotificationModel, {
    description: 'Mark a notification as read.',
  })
  markNotificationAsRead(
    @Args('id', { type: () => Int, description: 'Notification identifier.' })
    id: number,
    @Args('userId', {
      type: () => Int,
      description: 'Identifier of the notification recipient.',
    })
    userId: number,
  ) {
    return this.notificationsService.update(id, userId, { isRead: true });
  }

  @Mutation(() => NotificationModel, {
    description: 'Mark a notification as unread.',
  })
  markNotificationAsUnread(
    @Args('id', { type: () => Int, description: 'Notification identifier.' })
    id: number,
    @Args('userId', {
      type: () => Int,
      description: 'Identifier of the notification recipient.',
    })
    userId: number,
  ) {
    return this.notificationsService.update(id, userId, { isRead: false });
  }

  @Mutation(() => NotificationModel, { description: 'Delete a notification.' })
  deleteNotification(
    @Args('id', { type: () => Int, description: 'Notification identifier.' })
    id: number,
    @Args('userId', {
      type: () => Int,
      description: 'Identifier of the notification recipient.',
    })
    userId: number,
  ) {
    return this.notificationsService.remove(id, userId);
  }
}

@Resolver(() => UserModel)
export class UserFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => [PostModel], {
    description: 'Posts created by this user.',
    complexity: listComplexity,
  })
  posts(
    @Parent() user: UserModel,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.prisma.post.findMany({
      where: { authorId: user.id },
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  @ResolveField(() => [EventModel], {
    description: 'Events authored by this user.',
    complexity: listComplexity,
  })
  authoredEvents(
    @Parent() user: UserModel,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.prisma.event.findMany({
      where: { authorId: user.id },
      skip: params.skip,
      take: params.limit,
      orderBy: { date: 'asc' },
    });
  }

  @ResolveField(() => [ReviewModel], {
    description: 'Reviews created by this user.',
    complexity: listComplexity,
  })
  reviews(
    @Parent() user: UserModel,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.prisma.review.findMany({
      where: { authorId: user.id },
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  @ResolveField(() => [NotificationModel], {
    description: 'Notifications addressed to this user.',
    complexity: listComplexity,
  })
  notifications(
    @Parent() user: UserModel,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

@Resolver(() => PostModel)
export class PostFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => UserModel, {
    description: 'User who created this post.',
    nullable: true,
  })
  author(@Parent() post: PostModel) {
    return this.prisma.user.findUnique({
      where: { id: post.authorId },
      select: { id: true, name: true, email: true, avatar: true },
    });
  }

  @ResolveField(() => [ReviewModel], {
    description: 'Reviews written for this post.',
    complexity: listComplexity,
  })
  reviews(
    @Parent() post: PostModel,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    return this.prisma.review.findMany({
      where: { postId: post.id },
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

@Resolver(() => EventModel)
export class EventFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => UserModel, {
    description: 'User who created this event.',
    nullable: true,
  })
  author(@Parent() event: EventModel) {
    return this.prisma.user.findUnique({
      where: { id: event.authorId },
      select: { id: true, name: true, email: true, avatar: true },
    });
  }

  @ResolveField(() => [UserModel], {
    description: 'Users registered for this event.',
    complexity: listComplexity,
  })
  async participants(
    @Parent() event: EventModel,
    @Args('page', {
      type: () => Int,
      defaultValue: 1,
      description: 'Page number starting from 1.',
    })
    page: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_PAGE_SIZE,
      description: 'Items per page, up to 50.',
    })
    limit: number,
  ) {
    const params = pagination(page, limit);
    const registrations = await this.prisma.registration.findMany({
      where: { eventId: event.id },
      skip: params.skip,
      take: params.limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return registrations.map((registration) => registration.user);
  }
}

@Resolver(() => ReviewModel)
export class ReviewFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => UserModel, {
    description: 'User who wrote this review.',
    nullable: true,
  })
  author(@Parent() review: ReviewModel) {
    return this.prisma.user.findUnique({
      where: { id: review.authorId },
      select: { id: true, name: true, email: true, avatar: true },
    });
  }

  @ResolveField(() => PostModel, {
    description: 'Post that received this review.',
    nullable: true,
  })
  post(@Parent() review: ReviewModel) {
    return this.prisma.post.findUnique({
      where: { id: review.postId },
    });
  }
}

@Resolver(() => NotificationModel)
export class NotificationFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => UserModel, {
    description: 'User who received this notification.',
    nullable: true,
  })
  user(@Parent() notification: NotificationModel) {
    return this.prisma.user.findUnique({
      where: { id: notification.userId },
      select: { id: true, name: true, email: true, avatar: true },
    });
  }
}
