plugins {
    `java-library`
    id("com.gradleup.shadow") version "8.3.5" apply false
}

group = "com.example.mmorpg"
version = "0.1.0"

subprojects {
    apply(plugin = "java-library")

    group = rootProject.group
    version = rootProject.version

    java {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(21))
        }
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.release.set(21)
    }
}

configure(subprojects.filter { it.name != "shared-api" }) {
    apply(plugin = "com.gradleup.shadow")

    dependencies {
        "compileOnly"("io.papermc.paper:paper-api:1.21.8-R0.1-SNAPSHOT")

        if (project.name == "core-plugin") {
            "implementation"(project(":shared-api"))
            "implementation"("redis.clients:jedis:5.2.0")
            "implementation"("com.google.inject:guice:7.0.0")
        } else {
            "compileOnly"(project(":shared-api"))
            "compileOnly"(project(":core-plugin"))
        }
    }

    tasks.named("build") {
        dependsOn("shadowJar")
    }
}

project(":shared-api") {
    dependencies {
        "api"("com.google.code.gson:gson:2.11.0")
        "api"("redis.clients:jedis:5.2.0")
    }
}
