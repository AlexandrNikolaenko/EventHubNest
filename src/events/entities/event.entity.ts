export class Event {
  private registrationsCount: number;

  constructor(
    public readonly id: number,
    public title: string,
    public desc: string,
    public date: Date,
    public place: string,
    public authorId: number,
    public categoryId: number,
    registrationsCount = 0,
  ) {
    this.registrationsCount = registrationsCount;
  }

  reschedule(newDate: Date) {
    this.date = newDate;
  }

  changeLocation(newPlace: string) {
    this.place = newPlace;
  }

  rename(newTitle: string) {
    this.title = newTitle;
  }

  incrementRegistrations() {
    this.registrationsCount++;
  }

  decrementRegistrations() {
    if (this.registrationsCount > 0) {
      this.registrationsCount--;
    }
  }

  getRegistrationsCount() {
    return this.registrationsCount;
  }
}
