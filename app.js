const request = require('request');
const cheerio = require('cheerio');

request('https://www.imdb.com/title/tt0110912/quotes', function (error, response, html) {   // pulp fiction
// request('https://www.imdb.com/title/tt0451279/quotes', function (error, response, html) {    // wonder woman
    if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        const result = $('.quote')
            .map((index, obj) => {
                return {
                    quote: $('.sodatext > p', obj).map((index, quote) => {
                        return {
                            // character who said the quote is always in a .character span
                            character: $('.character', quote).text(),

                            text: quote.children
                                .filter(node =>
                                    // filter out all non-text nodes (the .character node gets stripped here, for example)
                                    node.type === 'text'

                                    // keep things like `[last words]`
                                    || node.type === 'tag' && node.name === 'span' /* && node.attribs.class.contains('fine') */
                                )
                                .map(node => {
                                    if (node.type === 'text') {
                                        // retrieve the text from the text node
                                        return node.data;
                                    } else if ( node.type === 'tag' && node.name === 'span' ) {
                                        // keep things like `[last words]`
                                        return node.children.map(child => child.data).join('');
                                    } else {
                                        console.warn("didn't find anything in node", node);
                                        return null; // drop from result
                                    }
                                })
                                .join('')               // concat all text (sometimes there is text like `[last words]` with no .character span
                                .trimLeft()             // remove leading whitespace
                                .replace(/^:\n?/, "")   // after the character span, there is a colon (ie: `Ares: some quote`)
                                .trimLeft()             // remove leading whitespace again
                                .trimRight()            // remove trailing whitespace
                        };
                    }).get() // convert from cheerio object to array
                };
            }).get(); // convert from cheerio object to array

        console.log(JSON.stringify(result, null, 2));
    }
});