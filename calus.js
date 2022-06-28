import { DateTime, Settings } from 'luxon'

export default {
    props: {
        timeZone: String,
        availableDates: {
            type: Array,
            default: function () {
                return [];
            },
        },
        displayInColumn: {
            type: Boolean,
            default: false,
        },
        linearDates: {
            type: Boolean,
            default: false,
        },
        weekStartsOnSunday: {
            type: Boolean,
            default: false,
        },
        onSelect: {
            type: Function,
            required: true,
        },
        allowScrollingOutsideOfDateRange: {
            type: Boolean,
            default: true,
        },
        monthControlsClasses: {
            type: Array,
            default: function () {
                return [];
            },
        },
    },
    data: function () {
        return {
            currentDisplayedMonth: DateTime.local().startOf("month"),
            weekStartOffset: this.weekStartsOnSunday ? -1 : 0,
        };
    },
    computed: {
        now: function () {
            return DateTime.local();
        },
        firstAvailable: function () {
            return this.availableDates.length ? this.availableDates[0] : this.now;
        },
        lastAvailable: function () {
            return this.availableDates.length ? this.availableDates[this.availableDates.length - 1] : this.now;
        },
        months: function () {
            let months = [];
            let date = null;

            if (this.displayInColumn) {
                date =
                    this.firstAvailable < this.now
                        ? this.firstAvailable
                        : this.now;
            } else {
                date = this.currentDisplayedMonth;
            }

            let end = (
                this.displayInColumn
                    ? this.lastAvailable
                    : this.currentDisplayedMonth
            ).endOf("month");

            let startOfToday = this.now.startOf("day");

            while (date <= end) {
                let days = [];
                let monthStart;
                let monthEnd;

                if (this.linearDates) {
                    monthStart = date.hasSame(this.now, "month")
                        ? date
                        : date.startOf("month");
                    monthEnd = date.endOf("month");
                } else {
                    monthStart = date
                        .startOf("month")
                        .startOf("week")
                        .plus({ days: this.weekStartOffset });
                    monthEnd = date
                        .endOf("month")
                        .endOf("week")
                        .plus({ days: this.weekStartOffset });
                }

                for (
                    let day = monthStart;
                    day <= monthEnd;
                    day = day.plus({ days: 1 })
                ) {
                    const startOfDay = day.startOf('day');
                    const endOfDay = day.endOf('day');

                    const isAvailable = !!this.availableDates.find(dt => {
                        return dt >= startOfDay && dt <= endOfDay;
                    });

                    let startOf = day.startOf("day");

                    days.push({
                        time: day,
                        isToday: day.hasSame(this.now, "day"),
                        isAvailable: isAvailable,
                        isPast: startOf < startOfToday,
                        isFuture: startOf > startOfToday,
                        isThisMonth: day.hasSame(date, "month"),
                    });
                }

                months.push({
                    time: date.startOf("month"),
                    isCurrentMonth:
                        +days[10].time.startOf("month") ==
                        +startOfToday.startOf("month"),
                    isInCurrentYear:
                        +days[10].time.startOf("year") ==
                        +startOfToday.startOf("year"),
                    days: days,
                });

                date = date.plus({ months: 1 });
            }

            this.disableScroll();

            return months;
        },
    },
    methods: {
        // select a day
        select: function (day) {
            if (day.isAvailable) {
                // selected state is handled by direct DOM control
                // it's a bit hacky, but it prevents a full redraw
                // of the calendar, making it feel a lot snappier,
                // especially with large amount of displayed dates
                this.resetSelected();
                this.selectedDate = day.time;

                this.addSelectedStyle(this.selectedDate);

                this.onSelect(day);
            }
        },
        // resets the selected day
        resetSelected: function () {
            this.selectedDate = null;
            this.removeSelectedStyle();
        },
        addSelectedStyle: function (time) {
            let selectedEl = this.$el.querySelector(
                '[data-date="' + +time + '"]'
            );
            if (selectedEl) {
                selectedEl.classList.add("is-selected");
            }
        },
        removeSelectedStyle: function () {
            let currentSelectedDay = this.$el.querySelector(".day.is-selected");
            if (currentSelectedDay) {
                currentSelectedDay.classList.remove("is-selected");
            }
        },
        scrollMonth: function (delta) {
            if (!this.displayInColumn) {
                this.removeSelectedStyle();
                this.currentDisplayedMonth = this.currentDisplayedMonth.plus({
                    months: delta,
                });
                setTimeout(() => {
                    this.addSelectedStyle(this.selectedDate);
                }, 1);
            }
        },
        // Disable scrolling outside of date range
        disableScroll: function () {
            /**
             * Make sure everything is set correctly
             * before disabling scroll
             */
            if (this.allowScrollingOutsideOfDateRange) {
                return false;
            }

            if (!this.monthControlsClasses.length) {
                console.warn(
                    "month-controls-classes prop missing"
                );
            }

            if (this.displayInColumn) {
                console.warn(
                    "display-in-column prop incorrectly set. Consider changing to false"
                );
            }

            if (!this.monthControlsClasses.length || this.displayInColumn) {
                return false;
            }

            const min = this.firstAvailable;
            const max = this.lastAvailable;
            const prev = this.monthControlsClasses[0];
            const next = this.monthControlsClasses[1];

            if (min) {
                let prevEl = document.querySelector(prev);

                if (prevEl) {
                    if (this.currentDisplayedMonth.month === min.month && this.currentDisplayedMonth.year === min.year) {
                        prevEl.classList.add("disabled");
                        prevEl.disabled = true;
                    } else {
                        prevEl.classList.remove("disabled");
                        prevEl.disabled = false;
                    }
                } else {
                    console.error(`${prev} not found. Have you passed the correct class?`);
                }
            }

            if (max) {
                let nextEl = document.querySelector(next);

                if (nextEl) {
                    if (this.currentDisplayedMonth.month === max.month && this.currentDisplayedMonth.year === max.year) {
                        nextEl.classList.add("disabled");
                        nextEl.disabled = true;
                    } else {
                        nextEl.classList.remove("disabled");
                        nextEl.disabled = false;
                    }
                } else {
                    console.error(`${next} not found. Have you passed the correct class?`);
                }
            }
        },
    },
    beforeMount: function () {
        Settings.defaultZone = this.timeZone || null;
    },
};
