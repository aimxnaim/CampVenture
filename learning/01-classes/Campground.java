/**
 * ============================================================================
 *  YOUR TASK #2  --  delete this comment block when you are done
 * ============================================================================
 *
 * Do Review.java first. This one is the same skeleton with two new ideas:
 * composition and controlled mutability.
 *
 * The old app's version (model/campground.js), trimmed:
 *
 *     const CampgroundSchema = new Schema({
 *         title: String,
 *         image: [ImageSchema],
 *         geometry: { type: { type: String, enum: ['Point'] },
 *                     coordinates: { type: [Number] } },
 *         price: Number,
 *         description: String,
 *         location: String,
 *         author: { type: Schema.Types.ObjectId, ref: 'User' },
 *         reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
 *     });
 *
 * Images and the reviews list are deliberately left out for now -- both need
 * collections, which is Phase 0c. You will add reviews there.
 *
 * ----------------------------------------------------------------------------
 * REQUIREMENTS
 * ----------------------------------------------------------------------------
 *
 * 1. Declare it as:  public class Campground implements Owned
 *
 * 2. Six fields. Note which are final and which are not -- this is the point of
 *    the exercise:
 *
 *        private String title;                    // NOT final, editable
 *        private String description;              // NOT final, editable
 *        private final BigDecimal price;
 *        private final String location;
 *        private final Coordinates coordinates;
 *        private final User author;
 *
 *    Why the split? A campground gets edited -- that is the whole point of
 *    views/campground/edit.ejs. But only some things sensibly change. Making a
 *    field non-final is a decision, not a default: it says "this is expected to
 *    change over time." Everything else stays final so the compiler enforces
 *    that nothing else can.
 *
 * 3. BigDecimal needs an import at the very top of the file, above the class:
 *
 *        import java.math.BigDecimal;
 *
 *    Why not double? Because a double cannot hold 0.10 exactly, so money in a
 *    double drifts. Try it: System.out.println(0.1 + 0.2) prints
 *    0.30000000000000004. Fine for coordinates, not for prices. This is the
 *    same reason the database column is NUMERIC(10,2) and not a float.
 *
 * 4. COMPOSITION: the coordinates and author fields hold whole objects, not
 *    loose values. A Campground HAS-A Coordinates rather than carrying stray
 *    latitude and longitude doubles.
 *
 *    The payoff is that Coordinates already refuses impossible values, so
 *    Campground does not have to check them. Each type guards its own rules.
 *    Prefer this over inheritance -- a Campground is not a kind of User, it
 *    has one.
 *
 * 5. A constructor taking all six, in this order:
 *
 *        Campground(String title, BigDecimal price, String description,
 *                   String location, Coordinates coordinates, User author)
 *
 *    Throw IllegalArgumentException when:
 *        - title is null or blank      -> "title is required"
 *        - price is null               -> "price is required"
 *        - price is negative           -> "price cannot be negative, got 12.34"
 *        - author is null              -> "a campground must have an author"
 *
 *    Comparing BigDecimal needs a method, not an operator. `<` does not work on
 *    objects:
 *
 *        price.compareTo(BigDecimal.ZERO) < 0        // true when negative
 *
 *    compareTo returns a negative int, zero, or a positive int for
 *    less / equal / greater. You will meet this pattern again when sorting in
 *    Phase 0c.
 *
 *    (Do NOT use price.equals(BigDecimal.ZERO) to test for zero -- equals on
 *    BigDecimal also compares the number of decimal places, so 0.00 does not
 *    equal 0. compareTo is what you want. A genuine Java trap.)
 *
 * 6. Getters for all six: getTitle(), getPrice(), getDescription(),
 *    getLocation(), getCoordinates().
 *
 * 7. author() -- required by Owned, no "get" prefix.
 *
 * 8. Two setters, and only two:
 *
 *        public void setTitle(String title)
 *        public void setDescription(String description)
 *
 *    Both must re-run the same validation the constructor does. A setter is a
 *    second way into the object, and an unvalidated one hands you exactly the
 *    invalid state the constructor was written to prevent.
 *
 *    There are deliberately no setters for price, location, coordinates or
 *    author: those fields are final, so the compiler would reject one anyway.
 *
 * 9. toString(), marked @Override. Something like:
 *
 *        Campground[Kem Lambaian Danau, RM45.00, Janda Baik, Pahang, by alice]
 *
 * ----------------------------------------------------------------------------
 * HINTS
 * ----------------------------------------------------------------------------
 *
 * - Duplicating the title check between constructor and setter is fine for now.
 *   If it bothers you, extract a `private static void requireTitle(String)` and
 *   call it from both -- good instinct, and exactly what a private helper is for.
 * - Referring to another object's field goes through its accessor:
 *   author.getUsername(), coordinates.latitude()  (record -- no "get").
 * - "cannot assign a value to final variable price"? You wrote a setter for a
 *   final field. Delete the setter; the field is meant to be fixed.
 *
 * ============================================================================
 */
