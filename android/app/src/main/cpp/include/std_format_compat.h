#ifndef RN_STD_FORMAT_COMPAT_H
#define RN_STD_FORMAT_COMPAT_H

#include <string>
#include <sstream>

// Minimal compatibility shim: provide a tiny subset of std::format used in RN
// This intentionally supports the pattern used by graphicsConversions.h: "{}%"
// It is not a full implementation of std::format. It avoids external deps so
// CMake's test compile can succeed during configure.
namespace std {
  inline std::string format(const char* fmt) {
    return std::string(fmt);
  }

  template <typename T>
  inline std::string format(const char* fmt, const T& value) {
    std::string s(fmt);
    std::ostringstream oss;
    oss << value;
    std::string val = oss.str();
    size_t pos = s.find("{}");
    if (pos != std::string::npos) {
      s.replace(pos, 2, val);
    } else {
      s += val;
    }
    return s;
  }
}

#endif // RN_STD_FORMAT_COMPAT_H
