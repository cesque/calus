document.addEventListener('DOMContentLoaded', () => {
    let calendar1 = new Calus({
        el: '#calendar1',
        useDefaultTemplate: true,
    });

    console.log(calendar1);

    let calendar2 = new Calus({
        el: '#calendar2',
        availableDates: [
            window.luxon.DateTime.local(),
            window.luxon.DateTime.local().plus({days: 1}),
            window.luxon.DateTime.local().plus({days: 2}),
            window.luxon.DateTime.local().plus({weeks: 1}),
            window.luxon.DateTime.local().plus({weeks: 2}),
            window.luxon.DateTime.local().plus({months: 2}),
        ]
    });

    console.log(calendar2);

    let calendar3 = new Calus({
        el: '#calendar3',
        displayInColumn: true,
        linearDates: true,
        startFromCurrentWeek: false,
        useDefaultTemplate: true,
    });

    console.log(calendar3);

    let calendar4 = new Calus({
        el: '#calendar4',
        useDefaultTemplate: true,
        start: window.luxon.DateTime.local().plus({months: -6}),
        end: window.luxon.DateTime.local().plus({months: -3}),
        limitCalendar: true,
    });

    console.log(calendar4);
})