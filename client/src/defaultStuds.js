const stubs = {};

stubs.cpp=`
#include <iostream>
using namespace std;

int main()
{
    cout<<"Hello World";
    return 0;
}
`;

stubs.py = `
print("Hello World")
`;

export default stubs;