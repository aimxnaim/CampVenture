import java.util.Objects;

/**
 * A classic class -- the shape you will write most often, and the shape a JPA
 * entity takes in Phase 2.
 *
 * Compare this with Coordinates.java. Same idea, roughly eight times the code.
 * That gap is why records exist. But a record could not do the job here: from
 * Phase 4 a User has a database id and a password hash, and two users are the
 * same user because of their identity, not because every field matches.
 */
public class User {

    /*
     * FIELDS are private: nothing outside this class can reach in and change
     * them. They are also final: assigned exactly once, in the constructor,
     * never reassigned. Reach for `private final` by default and relax it only
     * when you have a reason -- Campground.title will be one.
     */
    private final String username;
    private final String email;

    /*
     * A CONSTRUCTOR has no return type and is named after the class.
     *
     * `this.username` is the field; plain `username` is the parameter. They are
     * allowed to share a name, and `this.` is what tells them apart. Leaving
     * off `this.` would assign the parameter to itself -- a silent no-op, and a
     * classic bug.
     */
    public User(String username, String email) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("username is required");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("a valid email is required, got: " + email);
        }
        this.username = username;
        this.email = email;
    }

    /*
     * GETTERS. Java has no property syntax, so accessors are written by hand.
     *
     * The getX() naming is not merely convention. Jackson, Thymeleaf and Spring
     * locate these by reflection using that exact name -- ${user.username} in a
     * Thymeleaf template calls getUsername(). Name it wrong and the framework
     * silently cannot see your data.
     *
     * There are no setters here, so a User cannot be modified after it is
     * built. Immutable objects have no invalid intermediate states and are safe
     * to share across threads.
     */
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    /*
     * equals() decides when two DIFFERENT objects count as "the same".
     *
     * Object's default compares memory addresses, so two User objects built
     * from identical data would be unequal -- almost never what you want. Here,
     * sameness means same username.
     *
     * @Override is not decoration: it makes the compiler check that you really
     * are replacing an inherited method. Misspell it as `equal` without the
     * annotation and your method is simply never called, while everything
     * still compiles. Always write it.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;                    // same object, nothing to compare
        }
        if (!(o instanceof User other)) {
            return false;                   // wrong type (or null) -- not equal
        }
        return username.equals(other.username);
    }

    /*
     * hashCode() MUST be overridden whenever equals() is, using the same
     * fields.
     *
     * HashMap and HashSet find an object by its hash first, then confirm with
     * equals(). If two equal objects report different hashes they land in
     * different buckets, and a HashSet will happily hold both -- a duplicate
     * that is invisible until it corrupts something. You will feel this in
     * Phase 0c.
     *
     * The rule: equal objects must have equal hash codes. Objects.hash() does
     * the arithmetic for you.
     */
    @Override
    public int hashCode() {
        return Objects.hash(username);
    }

    /*
     * Without this, printing a User gives you something like User@6d06d69c --
     * the memory address. Override it and every log line, debugger view and
     * assertion failure becomes readable. Cheap to write, pays for itself
     * immediately.
     */
    @Override
    public String toString() {
        return "User[" + username + "]";
    }
}
