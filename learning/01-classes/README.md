# Phase 0b — Classes, records, and interfaces

**~5 hours.** No framework, no database, no Spring. Just the language, modelling
a domain you already know inside out.

By the end you'll have written `Review` and `Campground` as plain Java and
gotten `Main` to compile and run.

## How to work through this

```sh
cd learning/01-classes
javac *.java        # compile every .java in this folder into .class files
java Main           # run the Main class
```

`javac *.java` will **fail** until you've written the two TODO files. That's the
exercise. Java's compiler errors are unusually good — read them literally:

```
Main.java:21: error: cannot find symbol
        Review review = new Review("Great spot", 5, alice);
                            ^
  symbol:   class Review
```

That's the compiler saying "you haven't written this yet." Fix, recompile,
repeat. **This loop is the single biggest difference from JavaScript**: in JS you
find out at runtime, in the browser, when a user hits the page. In Java you find
out at compile time, before anything runs. It feels slower for about a week and
then it feels like a safety net.

Delete the `.class` files any time — they're rebuilt (`.gitignore` already
excludes them).

## The files

| File | Status | What it teaches |
|---|---|---|
| `Coordinates.java` | **given** | records — immutable data carriers |
| `User.java` | **given** | a classic class — fields, constructor, getters |
| `Owned.java` | **given** | interfaces + default methods |
| `Review.java` | **you write** | apply both |
| `Campground.java` | **you write** | apply both, plus composition |
| `Main.java` | **given** | exercises everything; must compile and run |

Read the three given files first. They're commented for exactly this purpose.

---

## 1. Everything lives in a class

There are no top-level functions in Java. Every piece of code is inside a class,
and **a public class must live in a file with the same name** — `User` in
`User.java`. The compiler enforces it.

```java
public class Hello {
    public static void main(String[] args) {   // the entry point
        System.out.println("hi");
    }
}
```

`public static void main(String[] args)` is the incantation. `public` = callable
from anywhere. `static` = belongs to the class, not to an instance (see §5).
`void` = returns nothing. `String[] args` = command-line arguments, your
`process.argv`.

## 2. Types are declared and checked before it runs

```js
let name = "Aiman";        // JavaScript
name = 42;                 // fine, whatever
```
```java
String name = "Aiman";     // Java
name = 42;                 // compile error. Not a warning. It will not build.
```

Type goes **before** the name: `String name`, not `name: String` like
TypeScript. `var` exists for local variables where the type is obvious:

```java
var campgrounds = new ArrayList<Campground>();   // inferred as ArrayList<Campground>
```

`var` is only for locals — never fields, parameters, or return types. Use it when
the right-hand side already says the type, otherwise be explicit.

### Primitives vs objects

Java has eight **primitive** types that are not objects. Each has an object
wrapper:

| Primitive | Wrapper | Notes |
|---|---|---|
| `int` | `Integer` | whole numbers |
| `long` | `Long` | bigger whole numbers — database IDs |
| `double` | `Double` | decimals; **not for money** |
| `boolean` | `Boolean` | `true` / `false` only — no truthiness |
| `char` | `Character` | a single character |

The distinction that will bite you: **primitives cannot be `null`, wrappers can.**
`int rating` is always some number; `Integer rating` might be `null`. Prefer
primitives unless you specifically need "absent."

Two more things that catch JS developers:

- **No truthiness.** `if (name)` doesn't compile. Write `if (name != null)` or
  `if (!name.isEmpty())`. The condition must genuinely be a `boolean`.
- **`==` on objects compares identity, not value.** `"a" == "a"` may be true by
  accident (string interning) but `new String("a") == new String("a")` is false.
  **Always use `.equals()` for objects.** This is Java's single most common
  beginner bug.

### Money

`double` cannot represent `0.1` exactly, so money in a `double` silently drifts.
Use `BigDecimal`:

```java
BigDecimal price = new BigDecimal("35.00");   // String constructor, always
price.add(new BigDecimal("5.00"));            // methods, not + operator
```

Verbose and annoying — and the reason the design document says *money is never a
float*. You'll meet it again as `NUMERIC(10,2)` in the database.

## 3. A class: fields, constructor, methods

Read `User.java` alongside this.

```java
public class User {
    private final String username;          // field: private and final

    public User(String username) {          // constructor: no return type, name = class
        this.username = username;           // `this` disambiguates field from parameter
    }

    public String getUsername() {           // getter
        return username;
    }
}
```

- **`private`** — nothing outside this class can touch the field. Default to this.
- **`final`** — assign once, never reassign. Like `const`. Default to this too;
  immutable objects are simpler to reason about and safe across threads.
- **Getters** — Java has no `get`/`set` property syntax, so accessors are written
  by hand. The `getX()` / `isX()` naming isn't just convention: Spring, Jackson,
  and Thymeleaf all **look for those exact names** by reflection. `${user.username}`
  in a Thymeleaf template actually calls `getUsername()`.

### Access modifiers

| Modifier | Visible to |
|---|---|
| `public` | everyone |
| `private` | this class only |
| `protected` | this class, subclasses, same package |
| *(nothing)* | same package only — "package-private" |

Rule of thumb: fields `private`, methods `public` only if something outside
genuinely calls them.

### Validate in the constructor

```java
public User(String username) {
    if (username == null || username.isBlank()) {
        throw new IllegalArgumentException("username is required");
    }
    this.username = username;
}
```

An object that exists is a valid object. No half-built states. This is the same
job `schema.js` does with Joi, pushed down into the type itself.

## 4. Records — the good part

Most classes are just data with no behaviour. Java 16 added **records** for
exactly that. Read `Coordinates.java`.

```java
public record Coordinates(double latitude, double longitude) { }
```

That one line gives you, generated by the compiler:

- a constructor taking both values
- accessors — note: **`latitude()`, not `getLatitude()`**
- `equals()` and `hashCode()` comparing by value
- a readable `toString()`
- fields that are `private final` — records are immutable, always

The pre-records version of that is about 40 lines. You'll still meet those in
older codebases.

Validate with a **compact constructor** — no parameter list, no assignments:

```java
public record Coordinates(double latitude, double longitude) {
    public Coordinates {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("bad latitude: " + latitude);
        }
    }
}
```

**When to use which:** record for immutable values (coordinates, DTOs, API
responses). Class for things with identity that change over time (a `Campground`
that gets edited, a JPA entity). We'll use records heavily for DTOs from Phase 5.

## 5. `static`

`static` means **belongs to the class, not to any instance**.

```java
public class Review {
    public static final int MIN_RATING = 1;   // one shared constant
    private final int rating;                 // one per Review object

    public static boolean isValidRating(int r) {    // no instance needed
        return r >= MIN_RATING && r <= MAX_RATING;
    }
}

Review.isValidRating(5);       // called on the class
review.getRating();            // called on an object
```

`static` methods can't touch instance fields — there's no instance to touch.
That's why `main` is static: it runs before any object exists.

`static final` in SHOUTY_CASE is Java's constant.

## 6. Interfaces

An interface is a contract: *what* without *how*. Read `Owned.java`.

```java
public interface Owned {
    User author();                              // implementers must provide this

    default boolean isOwnedBy(User user) {      // free, shared implementation
        return user != null && user.equals(author());
    }
}
```

Anything that `implements Owned` must supply `author()`, and gets `isOwnedBy()`
for nothing. This isn't academic — it's exactly the duplication in your current
app. `isAuthor` and `isReviewAuthor` in `middleware/middleware.js` are the same
logic written twice, once for campgrounds and once for reviews. With an
interface it's written once and both types get it.

`default` methods let you add behaviour to an interface without breaking existing
implementers — that's how `List` gained `forEach()` in Java 8.

Interfaces are also how you swap implementations. The design document has
`ImageStorage` as an interface with a Cloudinary implementation, precisely so
tests can substitute a fake that never touches the network.

## 7. Inheritance, briefly

```java
public class AdminUser extends User { ... }    // single inheritance only
```

You'll see `extends` in framework code, but **prefer composition** — a
`Campground` *has* a `User` author rather than *being* one. Java allows extending
exactly one class, but implementing any number of interfaces. That asymmetry is
deliberate: interfaces for "can do", inheritance sparingly for "is a".

`abstract class` sits between the two — some implementation, some left to
subclasses. You won't need it in this project.

## 8. `toString`, `equals`, `hashCode`

Every object inherits these from `Object`, and the defaults are useless:

```java
System.out.println(user);      // User@6d06d69c  ← the memory address
```

Override `toString()` so debugging output is readable. Override `equals()` and
`hashCode()` **together** if two distinct objects can be "the same" by value —
`HashMap` and `HashSet` rely on both agreeing, which you'll feel in Phase 0c.

Records do all three for you. Another reason to reach for them.

`@Override` above a method tells the compiler "this is meant to replace an
inherited method" — and it errors if you typo the name. Always write it.

---

## Your task

1. Read `Coordinates.java`, `User.java`, `Owned.java` top to bottom.
2. Read `Main.java` — it's the spec. It shows exactly how `Review` and
   `Campground` must be constructed and called.
3. Write `Review.java`:
   - `implements Owned`
   - fields: `body` (String), `rating` (int), `author` (User) — private, final
   - reject a null/blank body and a rating outside 1–5 in the constructor
   - `MIN_RATING` / `MAX_RATING` as `static final` constants
   - accessors, plus the `author()` method `Owned` demands
   - a readable `toString()`
4. Write `Campground.java`:
   - `implements Owned`
   - fields: `title`, `price` (`BigDecimal`), `description`, `location`,
     `coordinates` (`Coordinates`), `author` (`User`)
   - reject a null/blank title and a negative price
   - `title` and `description` must be editable after construction
     (`setTitle`, `setDescription`) — so **not** a record, and those two fields
     aren't `final`. Everything else is.
   - accessors, `author()`, `toString()`
5. `javac *.java && java Main` until it runs clean.

Expected output is at the bottom of `Main.java`.

### Questions to sit with

Worth having an answer to before Phase 1 — ask me about any of them:

- Why is `Coordinates` a record but `Campground` a class?
- Why does `Owned.isOwnedBy` use `.equals()` instead of `==`?
- What breaks if `Review.rating` is `Integer` instead of `int`?
- Why validate in the constructor rather than in a `save()` method later?

## Done when

- [ ] `javac *.java` produces no errors
- [ ] `java Main` prints the expected output
- [ ] You can explain, out loud, when to reach for a record over a class
