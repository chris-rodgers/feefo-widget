import { h, Component } from "preact";
import Stars, { Defs } from "./components/Stars";
import request from "./request";
import styles from "./style.scss";
import logo from "./assets/logo.svg";
export default class App extends Component {
	state = {
		total: {
			rating: null,
			reviews: 5823
		},
		reviews: [],
		loading: false
	};

	componentDidMount = () => {
		const { reviews } = this.state;
		const { merchant_identifier } = this.props;
		request(
			`https://api.feefo.com/api/10/reviews/summary/all?merchant_identifier=${merchant_identifier}`
		).then(data => {
			const { rating } = JSON.parse(data.response).rating;
			this.setState({ total: { ...this.state.total, rating } });
		});
		this.getReviews(reviews.length);
	};

	getReviews = page => {
		const { merchant_identifier } = this.props;
		const count = 4;

		page = page + 1;

		this.setState({ loading: true });

		request(
			`https://api.feefo.com/api/10/reviews/all?merchant_identifier=${merchant_identifier}&page_size=${count}&page=${page}`
		).then(data => {
			const { reviews } = JSON.parse(data.response);
			this.setState({
				reviews: [...this.state.reviews, ...reviews],
				loading: false
			});
		});
	};

	render(props) {
		const { buttonClass } = this.props;
		const { total, reviews, loading } = this.state;
		const baseClass = "feefo-widget";

		return (
			<div class={styles[baseClass]}>
				<Defs />
				{total.rating && (
					<div class={styles[`${baseClass}-header`]}>
						<div class={styles[`${baseClass}-header__title`]}>
							Average Customer Rating:
						</div>
						<div class={styles[`${baseClass}-header__stars`]}>
							<Stars rating={total.rating} />
						</div>
						<div class={styles[`${baseClass}-header__divider`]}>
							<div class={styles[`${baseClass}-header__rating`]}>
								<b>{total.rating}</b>/5
							</div>
							<img
								class={styles[`${baseClass}-header__logo`]}
								src={logo}
							/>
						</div>
						<div class={styles[`${baseClass}-header__text`]}>
							Independent Service Rating based on {total.reviews}{" "}
							verified reviews. Read all reviews
						</div>
					</div>
				)}
				<Defs />
				{reviews.length ? (
					<div class={styles[`${baseClass}-reviews`]}>
						{reviews.map(item => {
							const { rating } = item.service.rating;
							const { title, review } = item.service;

							return (
								<div class={styles[`${baseClass}-review`]}>
									<Stars
										class={
											styles[`${baseClass}-review__stars`]
										}
										rating={rating}
									/>
									{title && (
										<h3
											class={
												styles[
													`${baseClass}-review__title`
												]
											}
										>
											{title}
										</h3>
									)}
									<p
										class={
											styles[
												`${baseClass}-review__review`
											]
										}
									>
										{review}
									</p>
								</div>
							);
						})}
					</div>
				) : null}
				<div class={styles[`${baseClass}-button-container`]}>
					<button
						class={buttonClass}
						onClick={() => this.getReviews(reviews.length)}
						disabled={loading}
					>
						{loading ? "Loading" : "Load More"}
					</button>
				</div>
			</div>
		);
	}
}
