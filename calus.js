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
            currentDisplayedMonth: DateTime.local().startOf("month")
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

            let startOfCurrentlyDisplayed = this.availableDates.findIndex(
                (x) => x > date
            );
            let available = this.availableDates.slice(
                this.displayInColumn ? 0 : startOfCurrentlyDisplayed
            );

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
                    while (available.length && day > available[0]) {
                        available.shift();
                    }

                    let isAvailable = false;

                    if (available.length && available[0].day === day.day) {
                        isAvailable = true;
                    }

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
            if (
                this.monthControlsClasses.length &&
                !this.displayInColumn &&
                !this.allowScrollingOutsideOfDateRange
            ) {
                const min = this.firstAvailable;
                const max = this.lastAvailable;
                const prev = this.monthControlsClasses[0];
                const next = this.monthControlsClasses[1];

                if (min) {
                    if (this.currentDisplayedMonth.month === min.month) {
                        document.querySelector(prev).classList.add("disabled");
                    } else {
                        document.querySelector(prev).classList.remove("disabled");
                    }
                }

                if (max) {
                    if (this.currentDisplayedMonth.month === max.month) {
                        document.querySelector(next).classList.add("disabled");
                    } else {
                        document.querySelector(next).classList.remove("disabled");
                    }
                }
            }

            if (!this.monthControlsClasses.length) {
                console.warn("month-controls-classes prop missing or incorrect");
            }

            if (this.displayInColumn) {
                console.warn(
                    "display-in-column prop incorrectly set. Consider changing to false"
                );
            }

            if (this.allowScrollingOutsideOfDateRange) {
                console.warn(
                    "allow-scrolling-outside-of-date-range prop incorrectly set. Consider changing to false"
                );
            }
        },
    },
    beforeMount: function () {
        Settings.defaultZone = this.timeZone || null;
    },
};
