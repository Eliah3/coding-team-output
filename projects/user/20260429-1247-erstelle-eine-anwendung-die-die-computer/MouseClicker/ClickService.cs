using System.Windows.Threading;
using MouseClicker.NativeMethods;

namespace MouseClicker
{
    /// <summary>
    /// Service-Klasse, die den Timer verwaltet und den Klick ausloest.
    /// </summary>
    public class ClickService
    {
        private readonly DispatcherTimer _timer;
        private bool _isRunning;

        public bool IsRunning
        {
            get => _isRunning;
            private set
            {
                _isRunning = value;
                // Einfaches Event fuer UI-Update
                RunningStateChanged?.Invoke(this, value);
            }
        }

        public event EventHandler<bool>? RunningStateChanged;

        public ClickService()
        {
            // DispatcherTimer laeuft auf dem UI-Thread, ideal fuer WPF
            _timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1) // 1 Klick pro Sekunde
            };
            _timer.Tick += OnTimerTick;
        }

        /// <summary>
        /// Startet den Klick-Automatisierung.
        /// </summary>
        public void Start()
        {
            if (IsRunning) return;

            IsRunning = true;
            _timer.Start();
        }

        /// <summary>
        /// Stoppt den Klick-Automatisierung.
        /// </summary>
        public void Stop()
        {
            if (!IsRunning) return;

            _timer.Stop();
            IsRunning = false;
        }

        /// <summary>
        /// Wird jede Sekunde aufgerufen.
        /// </summary>
        private void OnTimerTick(object? sender, EventArgs e)
        {
            PerformLeftClick();
        }

        /// <summary>
        /// Fuehrt einen echten Linksklick ueber die Windows API aus.
        /// </summary>
        private void PerformLeftClick()
        {
            // Wir brauchen zwei Events: Down und Up
            INPUT[] inputs = new INPUT[2];

            // 1. Maustaste runterdruecken
            inputs[0].type = NativeMethods.INPUT_MOUSE;
            inputs[0].mi.dwFlags = NativeMethods.MOUSEEVENTF_LEFTDOWN;

            // 2. Maustaste loslassen
            inputs[1].type = NativeMethods.INPUT_MOUSE;
            inputs[1].mi.dwFlags = NativeMethods.MOUSEEVENTF_LEFTUP;

            // Senden an das System
            uint result = NativeMethods.SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));

            if (result == 0)
            {
                // Fehlerbehandlung (optional: Logging)
                var error = Marshal.GetLastWin32Error();
                System.Diagnostics.Debug.WriteLine($"SendInput fehlgeschlagen mit Fehlercode: {error}");
            }
        }
    }
}