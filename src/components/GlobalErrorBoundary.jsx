import { Component } from "react";
import { withTranslation } from "react-i18next";

class GlobalErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("GlobalErrorBoundary:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">{t("errorBoundary.title")}</h1>
          <p className="mt-3 max-w-md text-sm text-slate-600">{t("errorBoundary.body")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-semibold text-white hover:bg-pioneer-orange-hover"
            >
              {t("errorBoundary.retry")}
            </button>
            <a
              href="/"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
            >
              {t("errorBoundary.home")}
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GlobalErrorBoundary = withTranslation()(GlobalErrorBoundaryInner);
export default GlobalErrorBoundary;
