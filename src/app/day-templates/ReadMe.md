Day Sections & Day Templates
Overview
The task management system currently organizes tasks by their doing date.
A "day" is not a separate domain entity. It is simply the collection of tasks that belong to a particular date.
The goal of this feature is to introduce a way to visually and logically divide a day's tasks into customizable sections, especially around times of day.
For example:
07:00 ─────────────────
Task A
Task B
Task C

11:00 ─────────────────
Task D
Task E

17:00 ─────────────────
Task F
Task G
These sections should make a long list of daily tasks easier to understand and navigate without turning the task system into a rigid calendar/scheduling system.

Module 1: Day Sections
A Day Section represents a section/divider within a specific day.
A section belongs to one particular date and is part of that day's task organization.
A section may represent a time of day, but the concept should remain flexible enough to support labels or other forms of organization.
The user should be able to:
Create sections for a day.
Remove sections.
Reorder sections.
Customize the section's displayed information.
Move tasks between sections.
Have tasks that are not assigned to any section.
Reorder tasks within a section.
Complete tasks without losing the section structure.
Sections are primarily an organizational and visual concept. They should not turn a task into a strict scheduled event unless the existing task system explicitly supports that separately.
A day may have no sections, a few sections, or many sections.
Sections should only exist for days where the user actually uses them.

Module 2: Day Templates
A Day Template is a reusable definition of a day structure.
It allows users to save common day structures and reuse them instead of manually creating the same sections every time.
Examples:
Work Day
University Day
Hobby Day
Vacation Day
A template contains a group of section definitions that can be applied to an actual day.
For example, a "Work Day" template might conceptually define:
Morning
Work
Lunch
Afternoon
Evening
When the user chooses that template for a particular day, the template's structure is used to create the sections for that day.
After applying a template, the resulting day's sections should be independent from the template. Modifying the sections of one particular day should not unexpectedly modify the template or other days that previously used it.
Templates are therefore presets, not shared live structures.

Relationship Between the Two
The conceptual relationship is:
Day Template
│
│ apply
▼
Day Sections for a specific date
│
▼
Daily Tasks
A template provides a reusable starting structure.
Day Sections are the actual sections used by a particular day's task list.
Tasks belong to their dates as they already do, and may optionally belong to one of that day's sections.

Desired User Experience
The normal daily task view should be able to display something like:
TODAY

07:00 ─────────────────
☐ Morning task
☐ Another task
☑ Completed task

11:00 ─────────────────
☐ Work task
☐ Meeting preparation

17:00 ─────────────────
☐ Workout
☐ Study
The exact UI is intentionally not defined here.
The important outcome is that users can turn a flat list of daily tasks into meaningful groups/dividers while retaining the existing task-management behavior.
The feature should remain useful even if the user never creates a template.
Templates are an optional convenience for users who repeatedly use similar day structures.

Important Design Principles

1. Do not make every day require sections
   A normal day should continue to work exactly as it does today.
   Sections are an additional organizational capability.
2. Do not make templates mandatory
   A user should be able to create and manage daily tasks without understanding or using templates.
3. Templates are presets
   Applying a template should give the user a starting structure for that day, not create a permanent dependency between the day and the template. 4. Sections organize; they do not necessarily schedule
   A time displayed on a section should primarily help organize the user's day.
   This feature should not automatically introduce the semantics of appointments, deadlines, duration, calendar events, or time blocking unless those concepts are explicitly added later. 5. Preserve existing task behavior
   The existing task system should remain the source of truth for tasks.
   Adding sections should not require redesigning the fundamental task model or changing the meaning of a task's doing date. 6. Keep the concept extensible
   The implementation should avoid making assumptions that prevent future variations such as:
   Sections with or without a displayed time.
   Named sections.
   Different structures for different days.
   Reusable templates.
   More sophisticated day planning in the future.
   The implementation should focus on establishing the core concepts cleanly without prematurely implementing those future features.
