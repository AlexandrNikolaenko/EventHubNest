export class Post {
  constructor(
    public readonly id: number,
    public title: string,
    public desc: string,
    public date: Date,
    public place: string,
    public authorId: number,
  ) {}

  updateContent(title: string, desc: string) {
    this.title = title;
    this.desc = desc;
  }

  changeLocation(newPlace: string) {
    this.place = newPlace;
  }

  reschedule(newDate: Date) {
    this.date = newDate;
  }
}
