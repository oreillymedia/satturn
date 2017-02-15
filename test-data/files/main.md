# A Simple Oriole

A really simple example:

You can write paragraphs like this.
  
``` python
hey = "hello world", 38+4
print(hey hello. This is an executable code block )!
```
     
::: #the-id
This is a block inside a div with an id the-id.
Very cool. Yes.
:::
     
```
hey = "hello world", 38+4
print(hey hello. This is a non executable block )!
```
::: #another-id 
## More complicated example
:::

``` python
x = [1,1]
for i in range(12):
    x.append(x[-1] + x[-2]) 
print(', '.join(str(y) for y in x))
```

## A Chart

::: #this-example
:::

``` python
%matplotlib inline
import matplotlib.pyplot as plt
import numpy as np
x = np.linspace(0, 3*np.pi, 500)
plt.plot(x, np.sin(x**2))
plt.title('A simple chirp');
```


## Seaborn Example

``` python
from __future__ import print_function, division

%matplotlib inline
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

x = np.linspace(0, 10, 1000)
plt.plot(x, np.sin(x), x, np.cos(x));

import seaborn as sns
sns.set()
plt.plot(x, np.sin(x), x, np.cos(x));
```

## Interactive widgets

``` python
%matplotlib inline
from IPython.display import Image
from IPython.html.widgets import interact
from numpy import pi, cos, sin
import numpy as np
import pylab as plt
import seaborn as sns
sns.set()
```


``` pyt
def plot_fringe(bl_length, wavelength):
    """ Plot the fringe function for a baseline (see Fig 1)

    bl_length:      distance between antennas, in m
    wavelength:     wavelength, in m
    """
    theta = np.linspace(-np.pi, np.pi, 401)
    l = sin(theta)
    F = cos(2 * pi * bl_length * l / wavelength)
    F2 = cos(2 * pi * 2 * bl_length * l / wavelength)

    plt.plot(l, F, c='#cc0000', label="Baseline 1-2")
    plt.plot(l, F2, c='#0000cc', label="Baseline 1-3")
    plt.xlabel("$sin(\\theta)$")
    plt.ylabel("Fringe amplitude")
    plt.ylim(-2, 2)
    plt.legend()

f = interact(plot_fringe, bl_length=(1, 100), wavelength=(1, 100))
</pre>
