process.title = 'Pretendo - Website';

const express = require('express');
const handlebars = require('express-handlebars');
const morgan = require('morgan');
const expressLocale = require('express-locale');
const cookieParser = require('cookie-parser');
const logger = require('./logger');
const util = require('./util');

const port = process.env.PORT || 8080;

const app = express();

logger.info('Setting up Middleware');
app.use(morgan('dev'));

logger.info('Setting up static public folder');
app.use(express.static('public'));

logger.info('Importing page routers');
const routers = {
	home: require('./routers/home'),
	faq: require('./routers/faq'),
	progress: require('./routers/progress'),
	blog: require('./routers/blog'),
	localization: require('./routers/localization')
};

app.use(cookieParser());

// Locale express middleware setup
app.use(expressLocale({
	'priority': ['default'],
	'default': 'en-US'
}));

app.use('/', routers.home);
app.use('/faq', routers.faq);
app.use('/progress', routers.progress);
app.use('/localization', routers.localization);
app.use('/blog', routers.blog);

logger.info('Creating 404 status handler');
// This works because it is the last router created
// Meaning the request could not find a valid router
app.use((request, response, next) => {
	const fullUrl = util.fullUrl(request);
	logger.warn(`HTTP 404 at ${fullUrl}`);
	next();
});

logger.info('Setting up handlebars engine');
app.engine('handlebars', handlebars({
	helpers: {
		doFaq(value, options) {
			let htmlLeft = '';
			let htmlRight = '';
			for (const [i, v] of Object.entries(value)) {
				const appendHtml = options.fn({
					...v
				}); // Tis is an HTML string
				if (i % 2 === 0) {
					htmlLeft += appendHtml;
				} else {
					htmlRight += appendHtml;
				}
			}
			return `
			<div class="left questions-left">
				${htmlLeft}
			</div>
			<div class="right questions-right">
				${htmlRight}
			</div>
			`;
		}
	}
}));
app.set('view engine', 'handlebars');

logger.info('Starting server');
app.listen(port, () => {
	logger.success(`Server listening on http://localhost:${port}`);
});