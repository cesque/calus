import Vue from 'vue'
import { DateTime } from 'luxon'

let defaultTemplate = `
<div class="month-container" v-bind:class="{ 'month-container--column': displayInColumn }">
    <div class="month" v-for="month in months" v-bind:data-month="month.time.toFormat('MM/y')">
        <div class="month__header">
        <button type="button" class="month__control month__control--prev" v-if="!displayInColumn" v-on:click="scrollMonth(-1)">
            ‹
        </button>
        <div class="month__text">
            {{ month.time.toFormat(month.isInCurrentYear ? 'MMMM' : 'MMMM y') }}
        </div>
        <button type="button" class="month__control month__control--prev" v-if="!displayInColumn" v-on:click="scrollMonth(1)">
            ›
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
            'is-this-month': day.isThisMonth,
            'is-different-month': !day.isThisMonth,
            }"
            v-on:click="select(day)"
        >
            <div class="day__inner">
                {{ day.time.day }}
            </div>
        </div>
        </div>
    </div>
</div>
`
export default function calus(options) {
    let el = options.el || '#calendar'
    let docEl = el instanceof HTMLElement ? el : document.querySelector(el)

    if (!docEl) throw 'no element found: ' + docEl

    if (options.useDefaultTemplate) {
        docEl.innerHTML = defaultTemplate
    }

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

            // linear view for when showing a free flowing calendar
            linearDates: options.linearDates || false,

            // which month is currently shown on screen (only used when
            // `displayInColumn` is false)
            currentDisplayedMonth: DateTime.local().startOf('month'),
            // force the day to start on sunday instead of default monday
            weekStartsOnSunday: options.weekStartsOnSunday || false,

            // callback for when an available date is clicked
            onSelect: options.onSelect || function (day) { },
            // callback for when selected month is changed with button
            onChangeMonth: options.onChangeMonth || function(prev, current) { },
        },
        computed: {
            now: () => DateTime.local(),
            firstAvailable: function () {
                return this.availableDates.length ? this.availableDates[0] : this.now
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

                let end = (this.displayInColumn ? this.lastAvailable : this.currentDisplayedMonth).endOf('month')
                let startOfToday = this.now.startOf('day')
                let availableDatesIndex = 0

                while (date <= end) {
                    let days = []
                    let monthStart
                    let monthEnd

                    availableDatesIndex = Math.max(0, availableDatesIndex - 7)

                    if (this.linearDates) {
                        monthStart = date.hasSame(this.now, 'month') ? date : date.startOf('month')
                        monthEnd = date.endOf('month')
                    } else {
                        monthStart = date.startOf('month').startOf('week').plus({ days: this.weekStartOffset })
                        monthEnd = date.endOf('month').endOf('week').plus({ days: this.weekStartOffset })
                    }

                    for (let day = monthStart; day <= monthEnd; day = day.plus({ days: 1 })) {
                        while(availableDatesIndex < available.length && day > available[availableDatesIndex]) {
                            availableDatesIndex++
                        }

                        let isAvailable = false
                        if (availableDatesIndex < available.length && available[availableDatesIndex].hasSame(day, 'day')) {
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

                    months.push({
                        time: date.startOf('month'),
                        isCurrentMonth: +days[10].time.startOf('month') == +startOfToday.startOf('month'),
                        isInCurrentYear: +days[10].time.startOf('year') == +startOfToday.startOf('year'),
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

                    this.addSelectedStyle(this.selected)

                    this.onSelect(day)
                }
            },
            setAvailable: function (array) {
                this.resetSelected()

                if (typeof array[0] == 'string') {

                    // check that they are valid ISO dates
                    let ISODates = []

                    try {
                        ISODates = array.map((x) => {
                            let isoDate =  DateTime.fromISO(x)
                            if (isoDate.isValid) {
                                return isoDate
                            } else {
                                throw "Invalid ISO string found"
                            }
                        })
                    } catch (error) {
                        console.error(error)
                    }

                    this.availableDates = ISODates
                } else {
                    this.availableDates = array
                }
            },
            // resets the selected day
            resetSelected: function () {
                this.selected = null
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
                if (!this.displayInColumn) {
                    this.removeSelectedStyle()
                    this.currentDisplayedMonth = this.currentDisplayedMonth.plus({ months: delta })
                    setTimeout(() => {
                        this.addSelectedStyle(this.selected)
                    }, 1)
                }
            }
        }
    })
}
