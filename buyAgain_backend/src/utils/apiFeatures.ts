// APIFeatures class for building chained database queries.
class APIFeatures<T> {
  // `query` is the Mongoose query, `queryString` is from the request.
  constructor(public query: any, public queryString: any) {}

  // Filters the query based on request parameters.
  filter(): this {
    // Exclude special fields from filtering.
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Replace operators (e.g., 'gt') with MongoDB's '$gt'.
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sorts the query based on a provided field or by creation date.
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // Limits the fields returned by the query.
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Exclude the MongoDB version key by default.
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // Paginates the query results.
  pagination(): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;