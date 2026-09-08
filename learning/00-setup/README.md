# Phase 0a — Installing Java, and the vocabulary around it

Coming from Node, the Java toolchain looks like more moving parts than it is.
There are really only four words to learn.

## The four words

**JVM** — the Java Virtual Machine. The thing that actually runs your program.
Rough analogue: the V8 engine inside Node.

**JRE** — Java Runtime Environment. JVM + the standard library. Enough to *run*
a Java program, not enough to compile one. You'll rarely install one separately
these days.

**JDK** — Java Development Kit. JRE + the compiler (`javac`) + tools
(`jar`, `jshell`, `javadoc`). **This is what you install.** Node bundles compiler
and runtime in one binary; Java splits them, and the JDK is the superset.

**LTS** — Long Term Support. Java releases every 6 months, but only some versions
get years of security patches: 8, 11, 17, **21**, 25. Companies run LTS versions,
so that's what you learn. We use **21**.

## Why `java` didn't work after installing it

Homebrew installs everything into `/opt/homebrew/Cellar/<name>/<version>/` and
then usually symlinks the binaries into `/opt/homebrew/bin/`, which is already on
your `PATH`. That's why `mvn` worked immediately.

`openjdk@21` is **keg-only**. Homebrew refuses to symlink it, because macOS has
its own `java` stub and several JDK versions would fight over the same name. So
it installs the files and hands the wiring to you.

It tells you this in the **caveats** it prints at the end of the install. You
will miss them — everyone does. Get them back any time with:

```sh
brew info openjdk@21
```

Reading caveats is a genuine habit worth building. Homebrew prints them once.

## PATH

`PATH` is a colon-separated list of directories your shell searches, in order,
when you type a command. First match wins.

```sh
echo $PATH | tr ':' '\n'      # read it one directory per line
which java                     # which one actually wins
```

There are four Java-ish things on this machine:

| Path | Version | What it is |
|---|---|---|
| `/opt/homebrew/opt/openjdk@21` | 21.0.12 | **JDK** — what we want, asked for explicitly |
| `/opt/homebrew/opt/openjdk@26` | 26.0.2 | JDK, pulled in as a Maven dependency |
| `/opt/homebrew/opt/openjdk` | 26.0.2 | Alias for the unversioned formula |
| `/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/…` | 1.8.0_503 | **JRE** — an old browser applet runtime |

Because first match wins, putting JDK 21's `bin` at the **front** of `PATH` makes
it the default and the rest go inert.

### The Java 8 that was already here

Before any of this was installed, `java -version` on this machine reported
`1.8.0_503`. That's the **Java Applet Plugin** — a leftover from when Java ran
inside web pages, reached through Apple's `/usr/bin/java` stub.

It's the JRE/JDK distinction made concrete. It can run Java but not compile it:

```sh
ls "/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/bin/"
# java, javaws, keytool, ...  10 tools, and no javac

ls /opt/homebrew/opt/openjdk@21/bin/
# java, javac, javadoc, jar, jdb, jshell, ...  29 tools
```

No `javac` means no compiler means it cannot build anything. Leave it alone —
once JDK 21 is first on `PATH` it stops mattering, and something may still
depend on it.

**Worth internalising:** "Java is installed" is never a complete answer. *Which*
Java, JDK or JRE, and does the thing you're running actually find it?

## JAVA_HOME

`PATH` tells your *shell* where `java` is. `JAVA_HOME` tells *other programs*
where the whole JDK lives — Maven, Gradle, and IntelliJ all read it. Setting one
without the other is the classic Java setup bug: `java -version` says 21 while
Maven quietly compiles against something else.

`JAVA_HOME` points at the JDK **root**, not its `bin`:

```
/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home     ← JAVA_HOME
/opt/homebrew/opt/openjdk@21/bin                                    ← goes on PATH
```

On macOS there's a helper that finds JDKs for you:

```sh
/usr/libexec/java_home -V        # list every JDK macOS can see
/usr/libexec/java_home -v 21     # print the path to JDK 21
```

## Run this

Appends two lines to your shell config, then reloads it:

```sh
echo '' >> ~/.zshrc
echo '# Java 21 (LTS) — see learning/00-setup/README.md' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"' >> ~/.zshrc
source ~/.zshrc
```

`~/.zshrc` runs every time you open a terminal — same file your `nvm` setup
already lives in. `source` re-runs it in the current shell so you don't have to
open a new window.

### Verify

All three must agree on 21:

```sh
java -version      # openjdk version "21.0.12"
javac -version     # javac 21.0.12          ← the compiler, not just the runtime
mvn -v             # Java version: 21.0.12  ← proves JAVA_HOME took effect
```

If `mvn -v` disagrees with `java -version`, `JAVA_HOME` is wrong. That is almost
always the cause.

> `java -version` prints to **stderr**, not stdout. So `java -version > out.txt`
> looks empty. Not a bug.

## Switching versions later

The lines above hard-code 21. When you eventually need to juggle versions
(a tutorial on 17, a new project on 25), install **SDKMAN** — it's `nvm` for
Java:

```sh
curl -s "https://get.sdkman.io" | bash
sdk list java
sdk install java 21.0.12-tem
sdk use java 21.0.12-tem       # this shell only
sdk default java 21.0.12-tem   # every shell
```

Not needed yet. One version is simpler.

## An IDE

Java leans on its IDE far more than JavaScript does. The language is verbose and
requires an explicit `import` for every type you touch; the tooling is what makes
that bearable.

**Decision: stay in VS Code.** Two reasons, one of them non-obvious:

1. Familiarity is worth a lot when the language, framework, database, and build
   tool are all new at once. One less unknown.
2. **IntelliJ Community Edition has no Spring support.** Bean navigation,
   `application.properties` autocomplete, and the endpoint mapping view are all
   Ultimate-only (paid). VS Code's Spring Boot Extension Pack gives you those
   free — so for *this* project VS Code actually beats IntelliJ CE on Spring.

Install both packs:

```sh
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-boot-dev-pack
```

- **Extension Pack for Java** (Microsoft) — language server, Maven support,
  debugger, test runner.
- **Spring Boot Extension Pack** (Broadcom/VMware) — Spring-aware autocomplete,
  bean navigation, live application info.

Restart VS Code afterwards. First open of a Java project triggers a one-time
indexing pass — the status bar shows it, and completions are unreliable until
it finishes.

### What you're giving up

IntelliJ's refactoring, debugger, and navigation into framework source are
genuinely better, and it's the industry standard you'll meet in a Java job.
Worth revisiting if you get an Ultimate licence through a student email or an
employer. Not worth the switching cost right now.

```sh
brew install --cask intellij-idea-ce    # only if you want to compare
```

## Where the docs are

Bookmark these. In roughly the order you'll need them:

| What | Where |
|---|---|
| **Java API reference** — every class in the standard library | <https://docs.oracle.com/en/java/javase/21/docs/api/> |
| **The Java Tutorials** — official, thorough, a bit dry | <https://dev.java/learn/> |
| **Spring Boot reference** — the manual, from Phase 1 on | <https://docs.spring.io/spring-boot/index.html> |
| **Spring Guides** — short task-shaped walkthroughs | <https://spring.io/guides> |
| **Baeldung** — the Stack Overflow of Java tutorials | <https://www.baeldung.com/> |
| **Maven central** — look up library coordinates | <https://central.sonatype.com/> |

Two habits worth forming now:

1. **Read the API docs directly.** Java's are unusually good — every class lists
   its methods with exact behaviour and its own history. When you meet `Optional`
   or `List` in Phase 0c, open the Javadoc for it rather than searching a blog.
2. **Pin the version in your searches.** Java and Spring changed a lot; a 2017
   Spring Boot 1.x answer will actively mislead you. Search "spring boot 3" and
   "java 21", and prefer `docs.spring.io` over blog posts for anything structural.

Offline, the same reference is at your fingertips: `javadoc` output ships with
the JDK, and IntelliJ shows it inline on hover (F1 / Ctrl-J).

## Done when

- [ ] `java -version`, `javac -version`, and `mvn -v` all report 21
- [ ] An IDE is installed and opens
- [ ] You can explain what keg-only meant and why `java` wasn't found
