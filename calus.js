import { DateTime, Settings } from 'luxon'

export default {
    props: ['timeZone', 'availableDates', 'displayInColumn', 'linearDates', 'weekStartsOnSunday', 'onSelect', 'onChangeMonth', 'allowPreviousScroll'],
    data: function() {
        return {
            // list of dates which are available to select (use `setAvailable()` to
            // set this if you want to provide a list of ISO dates instead of Luxon
            // date objects)
            datesAvailable: this.availableDates || [],
            // currently selected date. this is reset when changing available dates
            selectedDate: null,
            // whether to show all the months in a column, or a single month with
            // controls to change which month is shown
            renderInColumn: this.displayInColumn || false,
            // linear view for when showing a free flowing calendar
            linearView: this.linearDates || false,
            // which month is currently shown on screen (only used when
            // `displayInColumn` is false)
            currentDisplayedMonth: DateTime.local().startOf("month"),
            // force the day to start on sunday instead of default monday
            startWeekOnSunday: this.weekStartsOnSunday || false,
            // callback for when an available date is clicked
            onDateSelect: this.onSelect || function (day) {},
            // callback for when selected month is changed with button
            onMonthChange: this.onChangeMonth || function (prev, current) {},
            // whether to allow scrolling back to months previous to current month
            allowPrevScroll: this.allowPreviousScroll === 'true',
        };
    },
    computed: {
        now: function() {
            return DateTime.local()
        },
        firstAvailable: function () {
            return this.datesAvailable.length ? this.datesAvailable[0] : this.now;
        },
        lastAvailable: function () {
            return this.datesAvailable.length
                ? this.datesAvailable[this.datesAvailable.length - 1]
                : this.now.plus({ months: 2 })
        },
        months: function () {
            let months = []
            let date = null

            if (this.renderInColumn) {
                date = this.firstAvailable < this.now ? this.firstAvailable : this.now
            } else {
                date = this.currentDisplayedMonth
            }

            let startOfCurrentlyDisplayed = this.datesAvailable.findIndex(x => x > date)
            let available = this.datesAvailable.slice(this.renderInColumn ? 0 : startOfCurrentlyDisplayed)

            let end = (this.renderInColumn ? this.lastAvailable : this.currentDisplayedMonth).endOf('month');

            let startOfToday = this.now.startOf('day')

            while (date <= end) {
                let days = []
                let monthStart;
                let monthEnd;

                if (this.linearView) {
                    monthStart = date.hasSame(this.now, 'month') ? date : date.startOf('month');
                    monthEnd = date.endOf('month');
                } else {
                    monthStart = date.startOf('month').startOf('week').plus({ days: this.weekStartOffset });
                    monthEnd = date.endOf('month').endOf('week').plus({ days: this.weekStartOffset });
                }

                for (let day = monthStart; day <= monthEnd; day = day.plus({ days: 1 })) {
                    while(available.length && day > available[0]) {
                        available.shift()
                    }

                    let isAvailable = false

                    if (available.length && available[0].hasSame(day, 'day')) {
                        isAvailable = true
                    }

                    let startOf = day.startOf('day')

                    days.push({
                        time: day,
                        isToday: day.hasSame(this.now, 'day'),
                        isAvailable: isAvailable,
                        isPast: startOf < startOfToday,
                        isFuture: startOf > startOfToday,
                        isThisMonth: day.hasSame(date, 'month'),
                    })
                }

                const sameMonth = date.startOf('month').hasSame(this.now, 'month');
                const allowScroll = !this.allowPrevScroll && sameMonth;

                months.push({
                    time: date.startOf('month'),
                    isCurrentMonth: +days[10].time.startOf('month') == +startOfToday.startOf('month'),
                    isInCurrentYear: +days[10].time.startOf('year') == +startOfToday.startOf('year'),
                    days: days,
                    disablePrevScroll: allowScroll
                })

                date = date.plus({ months: 1 })
            }

            return months
        }
    },
    methods: {
        // select a day
        select: function (day) {
            if (day.isAvailable) {
                // selected state is handled by direct DOM control
                // it's a bit hacky, but it prevents a full redraw
                // of the calendar, making it feel a lot snappier,
                // especially with large amount of displayed dates
                this.resetSelected()
                this.selectedDate = day.time

                this.addSelectedStyle(this.selectedDate)

                this.onDateSelect(day);
            }
        },
        setAvailable: function (array) {
            this.resetSelected()

            if (typeof array[0] == 'string') {

                // check that they are valid ISO dates;
                let ISODates = [];

                try {
                    ISODates = array.map((x) => {
                        let isoDate =  DateTime.fromISO(x);
                        if (isoDate.isValid) {
                            return isoDate;
                        } else {
                            throw "Invalid ISO string found";
                        }
                    });
                } catch (error) {
                    console.error(error);
                }

                this.datesAvailable = ISODates;
            } else {
                this.datesAvailable = array
            }
        },
        // resets the selected day
        resetSelected: function () {
            this.selectedDate = null
            this.removeSelectedStyle()
        },
        addSelectedStyle: function(time) {
            let selectedEl = this.$el.querySelector('[data-date="' + (+time) + '"]')
            if(selectedEl) {
                selectedEl.classList.add('is-selected')
            }
        },
        removeSelectedStyle: function() {
            let currentSelectedDay = this.$el.querySelector('.day.is-selected')
            if (currentSelectedDay) {
                currentSelectedDay.classList.remove('is-selected')
            }
        },
        scrollMonth: function (delta) {
            if (!this.renderInColumn) {
                this.removeSelectedStyle()
                this.currentDisplayedMonth = this.currentDisplayedMonth.plus({ months: delta })
                setTimeout(() => {
                    this.addSelectedStyle(this.selectedDate)
                }, 1)
            }
        }
    },
	beforeMount: function() {
		Settings.defaultZoneName = this.timeZone || null;
	}
}
