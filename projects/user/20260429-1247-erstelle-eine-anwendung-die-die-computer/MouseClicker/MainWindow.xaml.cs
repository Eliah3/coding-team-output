using System.Windows;
using System.Windows.Media;

namespace MouseClicker
{
    public partial class MainWindow : Window
    {
        private readonly ClickService _clickService;

        public MainWindow()
        {
            InitializeComponent();

            // Service initialisieren
            _clickService = new ClickService();
            
            // Auf Service-Events hoeren ( fuer UI-Update )
            _clickService.RunningStateChanged += OnRunningStateChanged;
        }

        /// <summary>
        /// Behandelt den Klick auf den Start/Stop Button.
        /// </summary>
        private void ToggleButton_Click(object sender, RoutedEventArgs e)
        {
            if (_clickService.IsRunning)
            {
                _clickService.Stop();
            }
            else
            {
                _clickService.Start();
            }
        }

        /// <summary>
        /// Reagiert auf Veraenderungen des Service-Status.
        /// </summary>
        private void OnRunningStateChanged(object? sender, bool isRunning)
        {
            if (isRunning)
            {
                StatusLabel.Text = "Klickt...";
                StatusLabel.Foreground = new SolidColorBrush(Colors.Green);
                ToggleButton.Content = "Stopp";
                ToggleButton.Background = new SolidColorBrush(Color.FromRgb(244, 67, 54)); // Rot
            }
            else
            {
                StatusLabel.Text = "Bereit";
                StatusLabel.Foreground = new SolidColorBrush(Colors.Gray);
                ToggleButton.Content = "Start";
                ToggleButton.Background = new SolidColorBrush(Color.FromRgb(76, 175, 80)); // Gruen
            }
        }

        /// <summary>
        /// Wird beim Schliessen des Fensters aufgerufen.
        /// Stellt sicher, dass der Timer gestoppt wird.
        /// </summary>
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (_clickService.IsRunning)
            {
                _clickService.Stop();
            }
        }
    }
}