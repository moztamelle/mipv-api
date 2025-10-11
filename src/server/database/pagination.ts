class Pagination {
  private pages: number
  private result: number
  private currentPage: number
  private limit: number

  constructor(result: number, currentPage = 1, limit = 10) {
    this.pages = 1
    this.result = result
    this.currentPage = currentPage
    this.limit = limit

    if (this.result > 0) {
      this.pages = Math.ceil(this.result / this.limit)
    } else {
      this.pages = 1
    }

    if (this.currentPage > this.pages) {
      this.currentPage = this.pages
    }
  }

  public getLimit(): string {
    const offset = this.limit * (this.currentPage - 1)
    return `limit ${this.limit} offset ${offset}`
  }

  public getCurrentPage(): number {
    return Number(this.currentPage)
  }

  public getTotalPages(): number {
    return Number(this.pages)
  }
}

export default Pagination
