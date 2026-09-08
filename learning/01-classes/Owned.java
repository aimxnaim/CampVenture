/**
 * An INTERFACE: a contract describing what a type can do, without saying how.
 *
 * -------------------------------------------------------------------------
 * Why this exists
 * -------------------------------------------------------------------------
 * Open middleware/middleware.js in the old app and look at isAuthor (line 71)
 * and isReviewAuthor (line 81). They are the same six lines of logic written
 * twice -- once for campgrounds, once for reviews -- because JavaScript had no
 * way to say "these two things both have an author."
 *
 * This interface says exactly that. Anything that implements Owned promises to
 * supply an author(), and in exchange gets isOwnedBy() for free. The ownership
 * rule is written ONCE and both types get it. Add a fourth ownable thing later
 * and it costs one word: `implements Owned`.
 *
 * This is the shape the real permission check takes in Phase 5.
 */
public interface Owned {

    /*
     * An ABSTRACT method: a signature with no body. Every implementer must
     * provide one, and the compiler refuses to build the class if it does not.
     *
     * That is the whole point of an interface -- the promise is checked before
     * the program runs, rather than discovered as `undefined is not a function`
     * once it is live.
     *
     * Interface methods are public automatically; writing `public` here is
     * redundant.
     */
    User author();

    /*
     * A DEFAULT method: an interface method that DOES have a body. Implementers
     * inherit it and normally never think about it.
     *
     * Default methods were added in Java 8 so that interfaces could grow
     * without breaking every existing implementer -- it is how List gained
     * forEach() without every List in the world failing to compile overnight.
     *
     * Note `.equals(...)` and not `==`. `==` on objects asks "is this the same
     * object in memory?", which is almost never the question. Two User objects
     * loaded from the database in separate queries represent the same person
     * but sit at different addresses, so `==` would say false and the
     * permission check would deny the real owner. Once these become JPA
     * entities in Phase 2 that stops being hypothetical.
     */
    default boolean isOwnedBy(User user) {
        return user != null && user.equals(author());
    }
}
