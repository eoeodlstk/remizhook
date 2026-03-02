#!/usr/bin/env bash
set -euo pipefail

repo_type="unknown"

if [ -f pubspec.yaml ] && grep -q "flutter:" pubspec.yaml; then
  repo_type="flutter"
fi

if [ "$repo_type" = "unknown" ]; then
  if find . -path "*/app/src/main/AndroidManifest.xml" -type f | grep -q .; then
    if find . \( -name build.gradle -o -name build.gradle.kts \) -type f -print0 | xargs -0 grep -E "com.android.application" -n >/dev/null 2>&1; then
      repo_type="android_app"
    elif find . \( -name build.gradle -o -name build.gradle.kts \) -type f -print0 | xargs -0 grep -E "com.android.library" -n >/dev/null 2>&1; then
      repo_type="android_lib"
    fi
  fi
fi

if [ "$repo_type" = "unknown" ]; then
  if [ -d src/main/java ] || [ -d src/main/kotlin ]; then
    if find . \( -name build.gradle -o -name build.gradle.kts \) -type f -print0 | xargs -0 grep -E "org.springframework.boot|io.ktor|micronaut" -n >/dev/null 2>&1; then
      repo_type="backend"
    else
      repo_type="library"
    fi
  fi
fi

echo "repo_type=$repo_type" > detect.env
echo "Detected: $repo_type"
