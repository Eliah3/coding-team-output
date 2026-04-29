using System.Runtime.InteropServices;

namespace MouseClicker
{
    /// <summary>
    /// Kapselt die nativen Windows-Funktionen fuer Eingabesimulation.
    /// </summary>
    internal static class NativeMethods
    {
        // Konstanten fuer den Input-Typ
        public const uint INPUT_MOUSE = 0;

        // Konstanten fuer Maus-Events
        public const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        public const uint MOUSEEVENTF_LEFTUP = 0x0004;

        /// <summary>
        /// Struktur fuer einen generischen INPUT-Event.
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        public struct INPUT
        {
            public uint type;
            public MOUSEINPUT mi;
        }

        /// <summary>
        /// Struktur fuer Maus-Eingabedaten.
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        public struct MOUSEINPUT
        {
            public int dx;
            public int dy;
            public uint mouseData;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        /// <summary>
        /// Sendet einen oder mehrere Eingabe-Events an das System.
        /// </summary>
        /// <param name="nInputs">Anzahl der INPUT-Strukturen.</param>
        /// <param name="pInputs">Array von INPUT-Strukturen.</param>
        /// <param name="cbSize">Groesse einer INPUT-Struktur.</param>
        /// <returns>Anzahl der verarbeiteten Events.</returns>
        [DllImport("user32.dll", SetLastError = true)]
        public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);
    }
}