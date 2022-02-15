Designed to be used as a Vue component: `Vue.component(element, Calus)` where element is the name of the template i.e. 'calendar-calus'. You can then use:
```html
<calendar-calus inline-template></calendar-calus>
```

### Props
You can pass the following props from the template:
- `time-zone`: defaults to local otherwise can be explicitly set (i.e. Europe/London)
- `available-dates`: list of dates which are available to select
- `display-in-column`: whether to show all the months in a column, or a single month with controls to change which month is shown
- `linear-dates`: linear view for when showing a free flowing calendar
- `week-starts-on-sunday`: force the day to start on sunday instead of default monday
- `on-select`: callback for when an available date is clicked
- `on-change-month`: callback for when selected month is changed with button
- `allow-previous-scroll`: defaults to false, set to true if you want to be able to scroll to months previous to today's

### Methods
- `select()`: method to call when clicking on a date
- `setAvailable()`: pass array of date strings where an event is available
- `scrollMonth()`: pass 1 or -1 to scroll forward/previous one month

### Example Template
```html
<calendar-calus
    inline-template
    allow-previous-scroll="true"
	time-zone="America/Chicago"
>
    <div class="month-container" v-bind:class="{ 'month-container--column': displayInColumn }">
        <div class="month" v-for="month in months" v-bind:data-month="month.time.toFormat('MM/y')">
            <div class="month__header">
            <button type="button" class="month__control month__control--prev" :disabled="month.disablePrevScroll" v-if="!displayInColumn" v-on:click="scrollMonth(-1)">
                ‹
            </button>
            <div class="month__text">
                {{ month.time.toFormat(month.isInCurrentYear ? 'MMMM' : 'MMMM y') }}
            </div>
            <button type="button" class="month__control month__control--next" v-if="!displayInColumn" v-on:click="scrollMonth(1)">
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
</calendar-calus>
```
