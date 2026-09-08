/**
 * ============================================================================
 *  YOUR TASK #1  --  delete this comment block when you are done
 * ============================================================================
 *
 * Write this class from scratch. Main.java is the spec: it shows exactly how a
 * Review gets constructed and which methods get called on it.
 *
 * The old app's version, for reference (model/review.js):
 *
 *     const reviewSchema = new Schema({
 *         body: String,
 *         rating: Number,
 *         author: { type: Schema.Types.ObjectId, ref: 'User' }
 *     });
 *
 * ...plus the rules that lived somewhere else entirely, in schema.js:
 *
 *     body:   Joi.string().required()
 *     rating: Joi.number().required().min(1).max(5)
 *
 * Notice that in the old app the shape and the rules were in two different
 * files, and nothing forced them to agree. Here they are one thing.
 *
 * ----------------------------------------------------------------------------
 * REQUIREMENTS
 * ----------------------------------------------------------------------------
 *
 * 1. Declare it as:  public class Review implements Owned
 *
 * 2. Two constants, so the numbers are named rather than sprinkled around:
 *
 *        public static final int MIN_RATING = 1;
 *        public static final int MAX_RATING = 5;
 *
 *    `static` = one copy shared by the class, not one per Review.
 *    `final`  = never reassigned. SHOUTY_CASE is the convention for constants.
 *
 * 3. Three fields, all `private final`:
 *        body    (String)
 *        rating  (int)      <- primitive, not Integer. A review always HAS a
 *                              rating; there is no "absent" case to model, and
 *                              `int` cannot be null so you can never forget to
 *                              check.
 *        author  (User)
 *
 * 4. A constructor Review(String body, int rating, User author) that throws
 *    IllegalArgumentException when:
 *        - body is null or blank        -> "review body is required"
 *        - rating is outside 1..5       -> include the offending value in the
 *                                          message, e.g.
 *                                          "rating must be between 1 and 5, got 6"
 *        - author is null               -> "a review must have an author"
 *
 *    Put the checks BEFORE the assignments. An object that exists should
 *    already be a valid object.
 *
 *    Useful: "some text".isBlank() is true for "" and for "   ".
 *
 * 5. A static helper, callable without a Review in hand:
 *
 *        public static boolean isValidRating(int rating)
 *
 *    Use it inside the constructor too, so the rule exists in exactly one place.
 *
 * 6. Accessors: getBody() and getRating().
 *
 * 7. author() -- required by Owned. Note the name: no "get" prefix, because
 *    that is the signature the interface declared. Miss this and the compiler
 *    will tell you the class does not fulfil its contract.
 *
 * 8. toString(), marked @Override, readable. Something like:
 *
 *        Review[5 stars by alice: "Great spot"]
 *
 * ----------------------------------------------------------------------------
 * HINTS
 * ----------------------------------------------------------------------------
 *
 * - Model it on User.java. Same skeleton: fields, constructor with validation,
 *   getters, toString.
 * - `throw new IllegalArgumentException("...")` -- no parentheses around the
 *   throw, and no `throws` clause needed on the method.
 * - Build messages with + : "got " + rating
 * - Getting "Review is not abstract and does not override abstract method
 *   author()"? You declared `implements Owned` but have not written author()
 *   yet. The compiler is holding you to the contract -- that is the feature.
 *
 * ============================================================================
 */
