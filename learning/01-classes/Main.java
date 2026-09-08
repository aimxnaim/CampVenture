import java.math.BigDecimal;

/**
 * The driver. Treat this file as the SPEC for Review and Campground -- it shows
 * exactly which constructors and methods they must have.
 *
 * It will not compile until both are written. That is intended.
 *
 *     javac *.java
 *     java Main
 */
public class Main {

    public static void main(String[] args) {

        // --- Objects ---------------------------------------------------------
        // `new` calls the constructor. There is no `new` for records vs classes;
        // both work the same way from the outside.
        User alice = new User("alice", "alice@campventure.my");
        User bob = new User("bob", "bob@campventure.my");

        // A record. Real coordinates, from data/malaysiaCampsite.js.
        Coordinates jandaBaik = new Coordinates(3.3800, 101.7740);

        Campground camp = new Campground(
                "Kem Lambaian Danau",
                new BigDecimal("45.00"),        // String constructor -- never new BigDecimal(45.00)
                "A serene campsite in the lush greenery of Janda Baik.",
                "Janda Baik, Pahang",
                jandaBaik,
                alice);

        Review review = new Review("Great spot, very peaceful.", 5, bob);

        System.out.println("--- toString ---");
        System.out.println(camp);
        System.out.println(review);
        System.out.println(jandaBaik);          // free from the record
        System.out.println(alice);

        // --- The Owned interface ---------------------------------------------
        // Both types get isOwnedBy() without either one implementing it. This is
        // isAuthor and isReviewAuthor from middleware.js, written once.
        System.out.println();
        System.out.println("--- ownership ---");
        System.out.println("camp owned by alice?    " + camp.isOwnedBy(alice));
        System.out.println("camp owned by bob?      " + camp.isOwnedBy(bob));
        System.out.println("review owned by bob?    " + review.isOwnedBy(bob));
        System.out.println("review owned by null?   " + review.isOwnedBy(null));

        // A variable typed as the INTERFACE, not the class. Anything Owned fits
        // here -- which is how one permission check serves every ownable type.
        Owned thing = camp;
        System.out.println("as Owned, by alice?     " + thing.isOwnedBy(alice));

        // --- equals vs == ----------------------------------------------------
        // The most common Java beginner bug, in three lines.
        System.out.println();
        System.out.println("--- equals vs == ---");
        Coordinates same = new Coordinates(3.3800, 101.7740);
        System.out.println("equals? " + jandaBaik.equals(same));   // true  -- same VALUES
        System.out.println("==?     " + (jandaBaik == same));      // false -- different OBJECTS

        // --- Static members --------------------------------------------------
        // Called on the class. No Review object involved.
        System.out.println();
        System.out.println("--- static ---");
        System.out.println("rating 3 valid? " + Review.isValidRating(3));
        System.out.println("rating 9 valid? " + Review.isValidRating(9));
        System.out.println("range: " + Review.MIN_RATING + ".." + Review.MAX_RATING);

        // --- Controlled mutability -------------------------------------------
        System.out.println();
        System.out.println("--- mutation ---");
        camp.setTitle("Kem Lambaian Danau (renovated)");
        System.out.println("new title: " + camp.getTitle());
        // camp.setPrice(...) does not exist, and cannot: price is final.

        // --- Validation ------------------------------------------------------
        // try/catch gets covered properly in Phase 0c. For now: the code in
        // `try` runs, and if it throws, `catch` handles it instead of crashing.
        System.out.println();
        System.out.println("--- validation ---");

        try {
            new Review("nice", 6, bob);
            System.out.println("PROBLEM: rating 6 was accepted");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }

        try {
            new Coordinates(200, 0);
            System.out.println("PROBLEM: latitude 200 was accepted");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }

        try {
            new Campground("", new BigDecimal("10.00"), "d", "l", jandaBaik, alice);
            System.out.println("PROBLEM: blank title was accepted");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }

        try {
            new Campground("Valid", new BigDecimal("-5.00"), "d", "l", jandaBaik, alice);
            System.out.println("PROBLEM: negative price was accepted");
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }

        System.out.println();
        System.out.println("All done. No PROBLEM lines above means it works.");
    }
}

/*
 * ============================================================================
 * EXPECTED OUTPUT
 * ============================================================================
 *
 * The four toString lines are yours -- any readable format is fine. Everything
 * else must match exactly.
 *
 *   --- toString ---
 *   <your Campground toString>
 *   <your Review toString>
 *   Coordinates[latitude=3.38, longitude=101.774]
 *   User[alice]
 *
 *   --- ownership ---
 *   camp owned by alice?    true
 *   camp owned by bob?      false
 *   review owned by bob?    true
 *   review owned by null?   false
 *   as Owned, by alice?     true
 *
 *   --- equals vs == ---
 *   equals? true
 *   ==?     false
 *
 *   --- static ---
 *   rating 3 valid? true
 *   rating 9 valid? false
 *   range: 1..5
 *
 *   --- mutation ---
 *   new title: Kem Lambaian Danau (renovated)
 *
 *   --- validation ---
 *   rejected: rating must be between 1 and 5, got 6
 *   rejected: latitude must be between -90 and 90, got 200.0
 *   rejected: title is required
 *   rejected: price cannot be negative, got -5.00
 *
 *   All done. No PROBLEM lines above means it works.
 *
 * The exact wording of YOUR messages can differ -- only the "rejected:" prefix
 * comes from this file. What matters is that all four throw at all.
 * ============================================================================
 */
