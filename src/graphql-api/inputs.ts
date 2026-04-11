import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

@InputType({ description: 'Data needed to register a new user.' })
export class RegisterUserInput {
  @Field({ description: 'User email address.' })
  @IsEmail()
  email!: string;

  @Field({ description: 'User password.' })
  @IsString()
  @MinLength(4)
  password!: string;

  @Field({ description: 'User display name.' })
  @IsString()
  @MinLength(2)
  name!: string;
}

@InputType({ description: 'Data needed to log in.' })
export class LoginInput {
  @Field({ description: 'User email address.' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @Field({ description: 'User password.' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

@InputType({ description: 'Data needed to create a post.' })
export class CreatePostInput {
  @Field({ description: 'Post title.' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field({ description: 'Post description.' })
  @IsString()
  @IsNotEmpty()
  desc!: string;

  @Field({ description: 'Post date in ISO 8601 format.' })
  @IsDateString()
  date!: string;

  @Field({ description: 'Post event location.' })
  @IsString()
  @IsNotEmpty()
  place!: string;

  @Field({ description: 'Image URL or path for this post.' })
  @IsString()
  @IsNotEmpty()
  image!: string;

  @Field(() => Int, { description: 'Identifier of the post author.' })
  @IsInt()
  authorId!: number;
}

@InputType({ description: 'Data that can be changed in a post.' })
export class UpdatePostInput {
  @Field({ description: 'Post title.', nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ description: 'Post description.', nullable: true })
  @IsString()
  @IsOptional()
  desc?: string;

  @Field({ description: 'Post date in ISO 8601 format.', nullable: true })
  @IsDateString()
  @IsOptional()
  date?: string;

  @Field({ description: 'Post event location.', nullable: true })
  @IsString()
  @IsOptional()
  place?: string;

  @Field({ description: 'Image URL or path for this post.', nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field(() => Int, {
    description: 'Identifier of the post author.',
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  authorId?: number;
}

@InputType({ description: 'Data needed to create an event.' })
export class CreateEventInput {
  @Field({ description: 'Event title.' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field({ description: 'Event description.' })
  @IsString()
  @IsNotEmpty()
  desc!: string;

  @Field({ description: 'Event location.' })
  @IsString()
  @IsNotEmpty()
  place!: string;

  @Field({ description: 'Event date in ISO 8601 format.' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @Field(() => [String], {
    description: 'Email addresses of users registered for the event.',
  })
  @IsArray()
  @IsEmail({}, { each: true })
  users!: string[];
}

@InputType({ description: 'Data that can be changed in an event.' })
export class UpdateEventInput {
  @Field({ description: 'Event title.', nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ description: 'Event description.', nullable: true })
  @IsString()
  @IsOptional()
  desc?: string;

  @Field({ description: 'Event location.', nullable: true })
  @IsString()
  @IsOptional()
  place?: string;

  @Field({ description: 'Event date in ISO 8601 format.', nullable: true })
  @IsDateString()
  @IsOptional()
  date?: string;

  @Field(() => [String], {
    description: 'Email addresses of users registered for the event.',
    nullable: true,
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  users?: string[];
}

@InputType({ description: 'Data needed to create a review.' })
export class CreateReviewInput {
  @Field({ description: 'Review text.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @Field(() => Int, {
    description: 'Optional rating from 1 to 5.',
    nullable: true,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Field(() => Int, { description: 'Identifier of the review author.' })
  @IsInt()
  authorId!: number;

  @Field(() => Int, { description: 'Identifier of the reviewed post.' })
  @IsInt()
  postId!: number;
}

@InputType({ description: 'Data that can be changed in a review.' })
export class UpdateReviewInput {
  @Field({ description: 'Review text.', nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => Int, {
    description: 'Optional rating from 1 to 5.',
    nullable: true,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}

@InputType({ description: 'Data needed to create a notification.' })
export class CreateNotificationInput {
  @Field(() => Int, {
    description: 'Identifier of the notification recipient.',
  })
  @IsInt()
  userId!: number;

  @Field({ description: 'Notification message.' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
