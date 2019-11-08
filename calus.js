import Vue from 'vue'
import { DateTime } from 'luxon'

let defaultTemplate = `
<div class="month" v-for="month in months" v-bind:data-month="month.time.toFormat('MM/y')">
    <div class="month__header">
    <button type="button" class="month__control month__control--prev" v-if="!displayInColumn" v-on:click="scrollMonth(-1)">
        &lt;
    </button>
    <div class="month__text">
        {{ month.time.toFormat(month.isInCurrentYear ? 'MMMM' : 'MMMM y') }}
    </div>
    <button type="button" class="month__control month__control--prev" v-if="!displayInColumn" v-on:click="scrollMonth(1)">
        &gt;
    </button>
    </div>
    <div class="month__days">
    <div class="day"
        v-for="day in month.days"
        v-bind:data-date="+day.time"
        v-bind:class="{
        'is-today': day.isToday,
        'is-not-today': !day.isToday,
        'is-available': day.isAvailable,
        'is-not-available': !day.isAvailable,
        'is-past': day.isPast,
        'is-future': day.isFuture,
        'is-selected': day.isSelected,
        }"
        v-on:click="select(day)"
    >
        {{ day.time.day }}
    </div>
    </div>
</div>
`
export default function calus(options) {
    let el = options.el || '#calendar'
    let docEl = el instanceof HTMLElement ? el : document.querySelector(el)

    if (!docEl) throw 'no element found: ' + docEl

    docEl.innerHTML = defaultTemplate

    return new Vue({
        el: el,
        data: {
            // list of dates which are available to select (use `setAvailable()` to
            // set this if you want to provide a list of ISO dates instead of Luxon
            // date objects)
            availableDates: options.availableDates || [],
            // currently selected date. this is reset when changing available dates
            selected: null,
            // whether to show all the months in a column, or a single month with
            // controls to change which month is shown
            displayInColumn: options.displayInColumn || false,
            // which month is currently shown on screen (only used when
            // `displayInColumn` is false)
            currentDisplayedMonth: DateTime.local().startOf('month'),

            // callback for when an available date is clicked
            onSelect: options.onSelect || function (day) { }
        },
        computed: {
            now: () => DateTime.local(),
            firstAvailable: function () {
                return this.availableDates.length ? this.availableDates[0] : this.now;
            },
            lastAvailable: function () {
                return this.availableDates.length
                    ? this.availableDates[this.availableDates.length - 1]
                    : this.now.plus({ months: 2 })
            },
            months: function () {
                let months = []
                let date = null

                if (this.displayInColumn) {
                    date = this.firstAvailable < this.now ? this.firstAvailable : this.now
                } else {
                    date = this.currentDisplayedMonth
                }

                let startOfCurrentlyDisplayed = this.availableDates.findIndex(x => x > date)
                let available = this.availableDates.slice(this.displayInColumn ? 0 : startOfCurrentlyDisplayed)

                let startOfToday = this.now.startOf('day')

                while (date <= (this.displayInColumn ? this.lastAvailable : this.currentDisplayedMonth)) {
                    let days = []

                    for (let i = 1; i <= date.daysInMonth; i++) {
                        let day = date.set({ day: i })

                        let isAvailable = false
                        if (available.length && available[0].hasSame(day, 'day')) {
                            isAvailable = true
                            available.shift()
                        }


                        let startOf = day.startOf('day')

                        days.push({
                            time: day,
                            isToday: day.hasSame(this.now, 'day'),
                            isAvailable: isAvailable,
                            isPast: startOf < startOfToday,
                            isFuture: startOf > startOfToday,
                        })
                    }

                    months.push({
                        time: days[0].time.startOf('month'),
                        isCurrentMonth: +days[0].time.startOf('month') == +startOfToday.startOf('month'),
                        isInCurrentYear: +days[0].time.startOf('year') == +startOfToday.startOf('year'),
                        days: days
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
                    this.selected = day.time

                    this.$el.querySelector('[data-date="' + (+this.selected) + '"]').classList.add('is-selected')

                    this.onSelect({
                        day: day
                    })
                }
            },
            setAvailable: function (array) {
                this.resetSelected()
                if (typeof array[0] == 'string') {
                    this.availableDates = array.map(x => DateTime.fromISO(x))
                } else {
                    this.availableDates = array
                }
            },
            // resets the selected day
            resetSelected: function () {
                this.selected = null
                let currentSelectedDay = this.$el.querySelector('.day.is-selected')
                if (currentSelectedDay) {
                    currentSelectedDay.classList.remove('is-selected')
                }
            },
            scrollMonth: function (delta) {
                if (!this.displayInColumn) {
                    this.resetSelected()
                    this.currentDisplayedMonth = this.currentDisplayedMonth.plus({ months: delta })
                }
            }
        }
    })
}

