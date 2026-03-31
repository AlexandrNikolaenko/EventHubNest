export class CreateReviewDto {
  content: string;
  rating?: number;
  authorId: number;
  postId: number;
}
