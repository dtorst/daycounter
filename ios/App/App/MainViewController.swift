import UIKit
import WebKit
import Capacitor

class MainViewController: CAPBridgeViewController {
    private static let splashBackgroundColor = UIColor(
        red: 190.0 / 255.0,
        green: 68.0 / 255.0,
        blue: 5.0 / 255.0,
        alpha: 1.0
    )

    private var launchOverlay: UIView?
    private var launchOverlayProgressObservation: NSKeyValueObservation?

    override open func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        let webView = super.webView(with: frame, configuration: configuration)
        configureLaunchBackground(for: webView)
        return webView
    }

    override open func viewDidLoad() {
        view.backgroundColor = Self.splashBackgroundColor
        installLaunchOverlay()
        observeInitialWebViewLoad()
        super.viewDidLoad()
    }

    override open func capacitorDidLoad() {
        super.capacitorDidLoad()
        if let webView = webView {
            configureLaunchBackground(for: webView)
        }
        bridge?.registerPluginInstance(DayCounterWidgetBridgePlugin())
    }

    private func configureLaunchBackground(for webView: WKWebView) {
        webView.isOpaque = false
        webView.backgroundColor = Self.splashBackgroundColor
        webView.scrollView.backgroundColor = Self.splashBackgroundColor

        if #available(iOS 15.0, *) {
            webView.underPageBackgroundColor = Self.splashBackgroundColor
        }
    }

    private func installLaunchOverlay() {
        guard launchOverlay == nil else { return }

        let overlay = UIView()
        overlay.translatesAutoresizingMaskIntoConstraints = false
        overlay.backgroundColor = Self.splashBackgroundColor
        overlay.isUserInteractionEnabled = false

        if let splashImage = UIImage(named: "Splash") {
            let imageView = UIImageView(image: splashImage)
            imageView.translatesAutoresizingMaskIntoConstraints = false
            imageView.contentMode = .scaleAspectFill
            imageView.clipsToBounds = true
            overlay.addSubview(imageView)

            NSLayoutConstraint.activate([
                imageView.topAnchor.constraint(equalTo: overlay.topAnchor),
                imageView.trailingAnchor.constraint(equalTo: overlay.trailingAnchor),
                imageView.bottomAnchor.constraint(equalTo: overlay.bottomAnchor),
                imageView.leadingAnchor.constraint(equalTo: overlay.leadingAnchor)
            ])
        }

        view.addSubview(overlay)
        NSLayoutConstraint.activate([
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor)
        ])

        launchOverlay = overlay
    }

    private func observeInitialWebViewLoad() {
        guard let webView = webView else { return }

        launchOverlayProgressObservation = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] webView, _ in
            guard webView.estimatedProgress >= 1 else { return }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                self?.dismissLaunchOverlay()
            }
        }
    }

    private func dismissLaunchOverlay() {
        launchOverlayProgressObservation?.invalidate()
        launchOverlayProgressObservation = nil

        guard let launchOverlay = launchOverlay else { return }
        self.launchOverlay = nil

        UIView.animate(
            withDuration: 0.18,
            delay: 0,
            options: [.beginFromCurrentState, .curveEaseOut],
            animations: {
                launchOverlay.alpha = 0
            },
            completion: { _ in
                launchOverlay.removeFromSuperview()
            }
        )
    }
}
