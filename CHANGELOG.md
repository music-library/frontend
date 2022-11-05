# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Guiding Principles:

-   Changelogs are for humans, not machines.
-   There should be an entry for every single version.
-   The same types of changes should be grouped.
-   Versions and sections should be linkable.
-   The latest version comes first.
-   The release date of each version is displayed.
-   Mention whether you follow Semantic Versioning.

Types of changes:

-   **Added** for new features.
-   **Changed** for changes in existing functionality.
-   **Deprecated** for soon-to-be removed features.
-   **Removed** for now removed features.
-   **Fixed** for any bug fixes.
-   **Security** in case of vulnerabilities.

<!-- ## [Unreleased] -->

## [2.17.10] - 2022-11-05

### Added

-   Add new colors
-   Playing a track in the queue removes said track from queue

### Changed

-   Split mono-reducer into slices

### Fixed

-   Fix next up tracks breaking on first load if tracks have not loaded

## [2.17.6] - 2022-11-03

### Added

-   Show queue length badge in navLinks
-   Store queue in local storage
-   Queue next-up tracks uses active filters (search, tags, ect...)

### Fixed

-   Queue track overflow bug

## [2.14.4] - 2022-10-31

### Added

-   Queue page with drag-n-drop functionality
-   Display currently playing track above queue
-   Render five tracks which are up-next after the last queue track

### Fixed

-   Socket.io not working (Rollback to last known working version)
-   Hide non-existent Tracks when guessing indexes in the Queue

## [2.12.0] - 2022-10-11

### Added

-   Port from react-scripts to **Vite**
