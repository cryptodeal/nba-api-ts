import { loadTx } from '../fetchers';
import dayjs from 'dayjs';

interface TxEntity {
	name: string;
	url: string;
}

export type Tx = {
	date: Date;
	details: string;
	players: TxEntity[];
	coaches: TxEntity[];
	teams: TxEntity[];
};

export type SeasonTxList = {
	start: Date;
	end: Date;
	txs: Tx[];
};

const getPlayerTx = ($: cheerio.Root) => {
	const p = $('#content').find('p').first();
	const start = dayjs($(p).find('strong').first().text().trim(), 'MMMM D, YYYY').toDate();
	$(p).find('strong').first().remove();
	const end = dayjs($(p).find('strong').first().text().trim(), 'MMMM D, YYYY').toDate();

	const seasonTxList: SeasonTxList = {
		start,
		end,
		txs: []
	};

	$('.page_index')
		.find('li')
		.each(function (i, li) {
			const date = dayjs($(li).find('span').text().trim(), 'MMMM D, YYYY');
			$(li)
				.find('p')
				.each(function (i, p) {
					const tx: Tx = {
						date: date.toDate(),
						details: $(p).text().trim(),
						players: [],
						coaches: [],
						teams: []
					};
					$(p)
						.find('a')
						.each(function (i, a) {
							const href = $(a).attr('href');
							if (href) {
								const hrefSplit = href.split('/');
								if (href.includes('coaches')) {
									const coach: TxEntity = {
										name: $(a).text().trim(),
										url: hrefSplit[hrefSplit.length - 1].split('.')[0]
									};
									if (tx.coaches.findIndex((c) => c.url === coach.url) === -1)
										tx.coaches.push(coach);
									tx.coaches.push(coach);
								} else if (href.includes('players')) {
									const player: TxEntity = {
										name: $(a).text().trim(),
										url: hrefSplit[hrefSplit.length - 1].split('.')[0]
									};
									if (tx.players.findIndex((p) => p.url === player.url) === -1)
										tx.players.push(player);
								} else if (href.includes('teams')) {
									const team: TxEntity = {
										name: $(a).text().trim(),
										url: hrefSplit[hrefSplit.length - 2]
									};
									if (tx.teams.findIndex((t) => t.url === team.url) === -1) tx.teams.push(team);
								}
							}
						});
					seasonTxList.txs.push(tx);
				});
		});
	return seasonTxList;
};

export const getSeasonTx = async (league: string, season: number) => {
	const $ = await loadTx(league, season);
	return getPlayerTx($);
};
